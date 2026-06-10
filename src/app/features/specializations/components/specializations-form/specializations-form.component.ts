import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SpecializationRequest } from '../../../../core/models/specialization-request.model';
import { ToastService } from '../../../../core/services/toast.service';
import { SpecializationService } from '../../services/specialization.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-specializations-form',
  imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './specializations-form.component.html',
  styleUrl: './specializations-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecializationsFormComponent {
  private dialogRef = inject(MatDialogRef<SpecializationsFormComponent>);
  private toastService = inject(ToastService);
  private specializationService = inject(SpecializationService);

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  save() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const payload: SpecializationRequest = {
      ...this.fg.getRawValue(),
    };

    this.specializationService.add(payload).subscribe({
      next: () => {
        this.toastService.success('Specialization saved.');
        this.dialogRef.close(true);
      },
      error: (error) => this.toastService.error(error),
    });
  }
}
