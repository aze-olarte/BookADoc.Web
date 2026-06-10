import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { distinctUntilChanged, filter, startWith, switchMap } from 'rxjs';
import { AppointmentRequest } from '../../../../core/models/appointment-request.model';
import { SpecializationService } from '../../../../core/services/specialization.service';
import { ToastService } from '../../../../core/services/toast.service';
import { DoctorService } from '../../../doctors/services/doctor.service';
import { AppointmentService } from '../../services/appointment.service';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-appointments-add-form.component',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatListModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './appointments-add-form.component.html',
  styleUrl: './appointments-add-form.component.scss',
})
export class AppointmentsAddFormComponent {
  private dialogRef = inject(MatDialogRef<AppointmentsAddFormComponent>);
  private toastService = inject(ToastService);
  private appointmentService = inject(AppointmentService);
  private specializationService = inject(SpecializationService);
  private doctorService = inject(DoctorService);
  private destroyRef = inject(DestroyRef);

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    specialization: new FormControl<number | null>(null, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    doctor: new FormControl<number | null>(
      { value: null, disabled: true },
      { validators: [Validators.required], nonNullable: true },
    ),
    date: new FormControl<Date>(new Date(), {
      validators: [Validators.required],
      nonNullable: true,
    }),
    slotId: new FormControl<number[]>([], { validators: [Validators.required], nonNullable: true }),
    reason: new FormControl<string>('', { nonNullable: true }),
  });

  specializationOptions = toSignal(this.specializationService.getAll(), { initialValue: [] });
  doctorOptions = toSignal(
    this.fg.controls.specialization.valueChanges.pipe(
      startWith(this.fg.controls.specialization.value),
      filter(Boolean),
      switchMap((id) => this.doctorService.getAll(id)),
    ),
    {
      initialValue: [],
    },
  );
  slotOptions = toSignal(
    this.fg.valueChanges.pipe(
      distinctUntilChanged((a, b) => a.doctor === b.doctor && a.date === b.date),
      filter((value): value is { doctor: number; date: Date } => !!value.doctor && !!value.date),
      switchMap(({ doctor, date }) => this.doctorService.getSlots(doctor, date, date)),
    ),
    { initialValue: [] },
  );

  ngOnInit(): void {
    this.setValueChanges();
  }

  private setValueChanges() {
    this.fg.controls.specialization.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data) {
          this.fg.controls.doctor.enable();
          this.fg.controls.doctor.setValidators(Validators.required);
          this.fg.controls.doctor.updateValueAndValidity();
        } else {
          this.fg.controls.doctor.disable();
        }
      });
    this.fg.controls.doctor.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (data) {
          this.fg.controls.date.enable();
          this.fg.controls.date.setValidators(Validators.required);
          this.fg.controls.date.updateValueAndValidity();
        } else {
          this.fg.controls.date.disable();
        }
      });
  }

  save() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const formValues = this.fg.getRawValue();
    const payload: AppointmentRequest = {
      slotId: formValues.slotId[0],
      reason: formValues.reason,
    };

    this.appointmentService.addAppointment(payload).subscribe({
      next: () => {
        this.toastService.success('Appointment saved.');
        this.dialogRef.close(true);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
