import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { map } from 'rxjs/operators';
import { User } from '../../../contexts/user/domain/models/user.model';
import { AlertService } from '../../../contexts/shared/services/alert.service';

/**
 * Guard para bloquear acceso a rutas que un colaborador NO debe ver.
 * Solo permite el paso si el usuario es OWNER.
 */
export const ownerOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);
  const alertService = inject(AlertService);

  return userService.getProfile().pipe(
    map((user) => {
      const isCollab = authService.isCollaborator(user as User);
      
      if (isCollab) {
        alertService.showWarning(
          'Acceso Restringido',
          'No tienes permisos para acceder a esta sección de configuración.'
        );
        return router.createUrlTree(['/dashboard']);
      }
      
      return true;
    })
  );
};
