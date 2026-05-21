import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from '../../features/auth/services/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAuth()?.token || '';

  const newRequest = req.clone({
    headers: req.headers.append('X-Authentication-Token', token),
  });

  return next(newRequest);
};
