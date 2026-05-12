import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginRequest } from '../../../core/models/auth/login-request.model';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorResponse } from '../../../core/models/shared/error';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login.component',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  submit(): void {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = this.fg.getRawValue();
    this.authService.login(payload).subscribe({
      next: (response) => {
        this.authService.storeAuth(response);
        this.router.navigate(['/dashboard']);
      },
      error: (httpError: HttpErrorResponse) => {
        const apiError: ErrorResponse = httpError.error;
        if (apiError.statusCode === 422) {
          this.errorHandlerService.applyFormErrors(this.fg, apiError);
        }
        if (apiError.statusCode === 401) {
          this.toastService.error(apiError.errors[0].message);
        }
      },
    });
  }
}
