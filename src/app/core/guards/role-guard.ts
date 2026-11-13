import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || !requiredRoles.length) return true;

  const userRole = authService.getRole();

  if (requiredRoles.includes(userRole)) return true;

  router.navigate(['/forbidden']);
  return false;
};
