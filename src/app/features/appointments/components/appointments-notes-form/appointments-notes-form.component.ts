import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AppointmentStatus } from '../../../../core/models/appointment-status.enum';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ToastService } from '../../../../core/services/toast.service';
import { AppointmentService } from '../../services/appointment.service';
import { MatInputModule } from '@angular/material/input';

interface InputData {
  id: number;
  status: AppointmentStatus;
  role: UserRole;
}

@Component({
  selector: 'app-appointments-notes-form',
  imports: [MatDialogModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule],
  templateUrl: './appointments-notes-form.component.html',
  styleUrl: './appointments-notes-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsNotesFormComponent {
  private dialogRef = inject(MatDialogRef<AppointmentsNotesFormComponent>);
  private toastService = inject(ToastService);
  private appointmentService = inject(AppointmentService);
  readonly inputData = inject<InputData>(MAT_DIALOG_DATA);

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    notes: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  save() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const payload = this.fg.getRawValue();

    this.appointmentService.addNotes(this.inputData.id, payload).subscribe({
      next: () => {
        this.toastService.success('Notes saved.');
        this.dialogRef.close(true);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
