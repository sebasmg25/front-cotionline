import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BusinessService } from '../../../infraestructure/services/business/business.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Business } from '../domain/models/business.model';
import { AlertService } from '../../shared/services/alert.service';

export const hasBusinessGuard: CanActivateFn = (route, state) => {
    const businessService = inject(BusinessService);
    const router = inject(Router);
    const alertService = inject(AlertService);

    return businessService.findAll().pipe(
        map((businesses: Business[]) => {
            if (businesses && businesses.length > 0) {
                return true; // Use has at least one business, allow access
            } else {
                alertService.showWarning('Acceso Denegado', 'Debes registrar una empresa primero para acceder a las sedes.');
                return router.createUrlTree(['/dashboard']); // Redirect to dashboard
            }
        }),
        catchError(() => {
            return of(router.createUrlTree(['/dashboard']));
        })
    );
};
