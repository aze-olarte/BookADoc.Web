import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { ErrorResponse } from '../../../../core/models/error.model';
import { LoginRequest } from '../../../../core/models/login-request.model';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login.component',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterLink,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private errorHandlerService = inject(ErrorHandlerService);
  private router = inject(Router);

  get f() {
    return this.fg.controls;
  }

  fg = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
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
      error: (apiError: ErrorResponse) => {
        if (apiError.statusCode === 422) {
          this.errorHandlerService.applyFormErrors(this.fg, apiError);
        }
      },
    });
  }
}
