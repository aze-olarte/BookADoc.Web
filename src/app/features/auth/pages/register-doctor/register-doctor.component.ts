import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ErrorResponse } from '../../../../core/models/error.model';
import { RegisterRequest } from '../../../../core/models/register-request.model';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { SpecializationService } from '../../../specializations/services/specialization.service';
import { ToastService } from '../../../../core/services/toast.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-doctor',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  templateUrl: './register-doctor.component.html',
  styleUrl: './register-doctor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterDoctorComponent {
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private specializationService = inject(SpecializationService);
  specializationOptions = toSignal(this.specializationService.getAll(), { initialValue: [] });

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup(
    {
      name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      password: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      confirmPassword: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      licenseNumber: new FormControl<string>('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      specializationId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      consultationFee: new FormControl<number>(0, {
        validators: [Validators.required, Validators.min(0.01)],
        nonNullable: true,
      }),
      bio: new FormControl<string>('', { nonNullable: true }),
    },
    {
      validators: passwordMatchValidator('password', 'confirmPassword'),
    },
  );

  submit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const formValues = this.fg.getRawValue();
    const payload: RegisterRequest = {
      ...formValues,
      role: UserRole.Doctor,
      specializationId: formValues.specializationId as number,
    };
    this.authService.register(payload).subscribe({
      next: () => {
        this.toastService.success('You have successfully registered!');
        this.router.navigate(['/portal/dashboard']);
      },
      error: (apiError: ErrorResponse) => {
        if (apiError.statusCode === 422) {
          this.errorHandlerService.applyFormErrors(this.fg, apiError);
        }
      },
    });
  }
}
