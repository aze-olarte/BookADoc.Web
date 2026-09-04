import { Component, DestroyRef, Inject, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SlotRequest } from '../../../../core/models/slot-request.model';
import { ToastService } from '../../../../core/services/toast.service';
import { SlotService } from '../../services/slot.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { minDateValidator } from '../../../../shared/validators/mindate.validator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toDateOnly } from '../../../../shared/utils/date-time.utils';
import { toTimeOnly } from '../../../../shared/utils/date-time.utils';

@Component({
  selector: 'app-slot-form',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './slot-form.component.html',
  styleUrl: './slot-form.component.scss',
})
export class SlotFormComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<SlotFormComponent>);
  private toastService = inject(ToastService);
  private slotService = inject(SlotService);
  private destroyRef = inject(DestroyRef);
  readonly minDate: Date = new Date();
  minEndTime = signal<Date>(new Date());

  constructor(@Inject(MAT_DIALOG_DATA) public data: { doctorId: number }) {}

  get f() {
    return this.fg.controls;
  }

  ngOnInit(): void {
    this.setFormValueChanges();
  }

  fg = new FormGroup({
    date: new FormControl<Date>(new Date(), {
      validators: [Validators.required, minDateValidator(new Date())],
      nonNullable: true,
    }),
    startTime: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    endTime: new FormControl<Date | null>(null, {
      validators: [
        Validators.required,
        (control) => minDateValidator(this.minEndTime(), true)(control),
      ],
    }),
  });

  private setFormValueChanges(): void {
    this.fg.controls.startTime.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (!!data) {
          this.minEndTime.set(data);
          this.fg.controls.endTime.updateValueAndValidity();
        }
      });
  }

  save(): void {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const { date, startTime, endTime } = this.fg.getRawValue();

    // This guards runtime values and narrows the types for TypeScript.
    if (!startTime || !endTime) {
      return;
    }

    const payload: SlotRequest = {
      id: 0,
      date: toDateOnly(date),
      startTime: toTimeOnly(startTime),
      endTime: toTimeOnly(endTime),
    };

    this.slotService.addSlots(this.data.doctorId, payload).subscribe({
      next: () => {
        this.toastService.success('Slot saved.');
        this.dialogRef.close(true);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
