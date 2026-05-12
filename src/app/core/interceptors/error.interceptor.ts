import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../models/shared/error';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const error: ErrorResponse = httpError.error;
      if (httpError.status === 422) {
        return throwError(() => error);
      }

      if (httpError.status === 409) {
        toastService.error(error.errors[0].message ?? 'There is a conflict error.');
        return throwError(() => error);
      }

      if (httpError.status === 401) {
        if (!req.url.includes('')) {
          router.navigate(['/']);
        }
        toastService.error(
          error.errors[0].message ?? 'You are unauthorized to perform this action.',
        );
        return throwError(() => error);
      }

      if (httpError.status === 403) {
        toastService.error(error.errors[0].message ?? 'You are not allowed to perform this action');
        return throwError(() => error);
      }

      toastService.error('An unexpected error occurred. Please try again.');
      return throwError(() => error);
    }),
  );
};
