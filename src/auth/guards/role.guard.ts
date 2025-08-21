import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.isLoggedIn()) {
    console.warn('Usuario no autenticado, redirigiendo a /login', { from: state.url });
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  const expectedRole = route.data['role'];
  const role = authService.getRole();

  if (role === expectedRole) {
    return true;
  }

  console.warn('Rol no autorizado, redirigiendo a /login', { expected: expectedRole, got: role, from: state.url });
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};