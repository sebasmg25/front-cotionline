import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Verificamos si hay un token en el localStorage
  if (authService.isLoggedIn()) {
    return true; // Permitimos el paso
  }

  // 2. Si no está logueado, lo mandamos al login
  // Guardamos la URL a la que quería ir para redirigirlo después si queremos
  router.navigate(['/login']);
  return false; // Bloqueamos el paso
};
