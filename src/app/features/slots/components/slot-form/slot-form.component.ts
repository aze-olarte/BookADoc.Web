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
import { toDateOnly, toDateTime } from '../../../../shared/utils/date-time.utils';
import { toTimeOnly } from '../../../../shared/utils/date-time.utils';
import { SlotResponse } from '../../../../core/models/slot-response.model';
import { addMinutes } from 'date-fns';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-slot-form',
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatButtonModule,
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: { doctorId: number; event?: SlotResponse }) {}

  get f() {
    return this.fg.controls;
  }

  ngOnInit(): void {
    this.setFormValueChanges();
    this.setFormValues();
  }

  fg = new FormGroup({
    date: new FormControl<Date>(new Date(), {
      validators: [Validators.required, minDateValidator(new Date())],
      nonNullable: true,
    }),
    startTime: new FormControl<Date | null>(null, {
      validators: [Validators.required],
    }),
    endTime: new FormControl<Date | null>({
      value: null,
      disabled: true,
    }),
  });

  private setFormValueChanges(): void {
    this.fg.controls.startTime.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        if (!!data) {
          const endTime = addMinutes(data, 30);
          this.fg.patchValue({
            endTime,
          });
        }
      });
  }

  private setFormValues(): void {
    const event = this.data.event;
    if (!event) return;

    this.fg.patchValue({
      date: new Date(`${event.date}T00:00:00`),
      startTime: toDateTime(event.date, event.startTime),
      endTime: toDateTime(event.date, event.endTime),
    });
  }

  save(): void {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const { date, startTime, endTime } = this.fg.getRawValue();

    if (!startTime || !endTime) {
      return;
    }

    const payload: SlotRequest = {
      id: this.data.event ? this.data.event.id : 0,
      date: toDateOnly(date),
      startTime: toTimeOnly(startTime),
      endTime: toTimeOnly(endTime),
      isBooked: this.data.event ? this.data.event.isBooked : false,
    };

    this.slotService.addSlot(this.data.doctorId, payload).subscribe({
      next: () => {
        this.toastService.success('Slot saved.');
        this.dialogRef.close(true);
      },
      error: () => {},
    });
  }
}
