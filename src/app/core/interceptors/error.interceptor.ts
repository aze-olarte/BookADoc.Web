import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Error, ErrorResponse } from '../models/error.model';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const error: ErrorResponse = httpError.error;
      const customErrorMessage = error.errors.length ? setCustomErrorMessage(error.errors) : null;
      const isRefresh = req.url.includes('/auth/refresh');

      if (isRefresh) {
        return throwError(() => httpError);
      }

      if (httpError.status === 422) {
        return throwError(() => error);
      }

      if (httpError.status === 409) {
        toastService.error(customErrorMessage ?? 'There is a conflict error.');
        return throwError(() => error);
      }

      if (httpError.status === 401) {
        toastService.error(customErrorMessage ?? 'You are unauthorized to perform this action.');
        return throwError(() => error);
      }

      if (httpError.status === 403) {
        toastService.error(customErrorMessage ?? 'You are not allowed to perform this action');
        return throwError(() => error);
      }

      toastService.error('An unexpected error occurred. Please try again.');
      return throwError(() => error);
    }),
  );
};

const setCustomErrorMessage = (errorArray: Error[]) => {
  return errorArray.map((err) => err.message).join('\n');
};
