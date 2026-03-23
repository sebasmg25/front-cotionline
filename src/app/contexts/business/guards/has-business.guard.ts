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
      if (!business) {
        return router.createUrlTree(['/register-business']);
      }

      const status = business.status;

      if (status === BusinessStatus.VERIFIED) {
        return true;
      }

      if (status === BusinessStatus.PENDING) {
        if (state.url !== '/dashboard') {
          alertService.showInfo(
            'En Revisión',
            'Esta función se activará automáticamente cuando tu negocio sea verificado.',
          );
          return router.createUrlTree(['/dashboard']);
        }
        return true;
      }

      if (status === BusinessStatus.RECHAZADO) {
        alertService.showWarning(
          'Registro Rechazado',
          'Debes corregir la información de tu negocio para poder operar.',
        );
        return router.createUrlTree(['/dashboard/business/profile']);
      }

      return router.createUrlTree(['/register-business']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/register-business']));
    }),
  );
};
