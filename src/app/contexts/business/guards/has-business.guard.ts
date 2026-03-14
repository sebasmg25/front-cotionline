import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BusinessService } from '../../../infraestructure/services/business/business.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Business, BusinessStatus } from '../domain/models/business.model';
import { AlertService } from '../../shared/services/alert.service';
import { AuthService } from '../../../infraestructure/services/auth/auth.service';

export const hasBusinessGuard: CanActivateFn = (route, state) => {
  const businessService = inject(BusinessService);
  const router = inject(Router);
  const alertService = inject(AlertService);
  const authService = inject(AuthService);

  return businessService.findByUser().pipe(
    map((business: Business) => {
      // Si no hay negocio en absoluto (null/undefined)
      if (!business) {
        return router.createUrlTree(['/register-business']);
      }

      const status = business.status;

      // 1. Caso de Éxito: Negocio Verificado
      if (status === BusinessStatus.VERIFIED) {
        return true;
      }

      // 2. Caso: Negocio en espera ("PENDIENTE")
      if (status === BusinessStatus.PENDING) {
        // Si el usuario intenta entrar a una ruta protegida (ej: sedes),
        // lo mandamos al dashboard donde verá el banner informativo.
        if (state.url !== '/dashboard') {
          alertService.showInfo(
            'En Revisión',
            'Esta función se activará automáticamente cuando tu negocio sea verificado.',
          );
          return router.createUrlTree(['/dashboard']);
        }
        return true;
      }

      // 3. Caso: Negocio Rechazado
      if (status === BusinessStatus.RECHAZADO) {
        alertService.showWarning(
          'Registro Rechazado',
          'Debes corregir la información de tu negocio para poder operar.',
        );
        return router.createUrlTree(['/dashboard/business/profile']);
      }

      // 4. Por seguridad, si el estado no es claro
      return router.createUrlTree(['/register-business']);
    }),
    catchError(() => {
      // Si el servicio falla o da 404, asumimos que no hay negocio
      return of(router.createUrlTree(['/register-business']));
    }),
  );
};
