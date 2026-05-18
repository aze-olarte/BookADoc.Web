import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ErrorResponse } from '../../../../core/models/error.model';
import { RegisterRequest } from '../../../../core/models/register-request.model';
import { UserRole } from '../../../../core/models/user-role.enum';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../../../shared/validators/password-match.validator';

@Component({
  selector: 'app-register-patient',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
  ],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPatientComponent {
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

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

    const payload: RegisterRequest = {
      ...this.fg.getRawValue(),
      role: UserRole.Patient,
    };
    this.authService.register(payload).subscribe({
      next: (response) => {
        this.toastService.success('You have successfully registered!');
        this.authService.storeAuth(response);
        this.router.navigate(['/dashboard']);
      },
      error: (apiError: ErrorResponse) => {
        if (apiError.statusCode === 422) {
          this.errorHandlerService.applyFormErrors(this.fg, apiError);
        }
      },
    });
  }
}
