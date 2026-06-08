import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserRole } from '../../../../core/models/user-role.enum';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

interface InputData {
  id: number;
  status: AppointmentStatus;
  role: UserRole;
}

@Component({
  selector: 'app-appointments-status-form.component',
  imports: [MatDialogModule, MatFormFieldModule, ReactiveFormsModule, MatSelectModule],
  templateUrl: './appointments-status-form.component.html',
  styleUrl: './appointments-status-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsStatusFormComponent {
  private dialogRef = inject(MatDialogRef<AppointmentsStatusFormComponent>);
  private toastService = inject(ToastService);
  private appointmentService = inject(AppointmentService);
  readonly inputData = inject<InputData>(MAT_DIALOG_DATA);
  dropdownOptions = signal<string[]>(
    this.appointmentService.getStatusDropdownOptions(this.inputData.role, this.inputData.status),
  );

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    status: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  save() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const payload = this.fg.getRawValue();

    this.appointmentService.patchAppointmentStatus(this.inputData.id, payload).subscribe({
      next: () => {
        this.toastService.success('New Status saved.');
        this.dialogRef.close(true);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
