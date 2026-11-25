import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isApi = req.url.startsWith(environment.apiUrl);
  const isAuthCall = /\/auth\/(login|register|refresh|logout)/.test(req.url);
  if (!isApi || isAuthCall) return next(req);

  const withToken = (r: HttpRequest<unknown>, token: string | null) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  return next(withToken(req, authService.getAccessToken())).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return authService.refresh().pipe(
          switchMap((res) => next(withToken(req, res.token))),
          catchError((refreshErr) => {
            authService.clearSession();
            return throwError(() => refreshErr);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
