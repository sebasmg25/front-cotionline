import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap, filter, switchMap } from 'rxjs/operators';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { BusinessService } from '../../../infraestructure/services/business/business.service';
import { Business, BusinessStatus } from '../../../contexts/business/domain/models/business.model';
import { AlertService } from '../../shared/services/alert.service';
import { UserService } from '../../../infraestructure/services/user/user.service';
import { AuthService } from '../../../infraestructure/services/auth/auth.service';
import { User } from '../../../contexts/user/domain/models/user.model';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatExpansionModule,
    MatDividerModule,
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav implements OnInit {
  @Input() isMobile: boolean = false;
  @Output() closeSidenav = new EventEmitter<void>();

  private refreshBusiness$ = new BehaviorSubject<void>(undefined);

  hasBusiness$: Observable<boolean>;
  isVerified$: Observable<boolean>;
  isCollaborator$: Observable<boolean>;
  private currentBusiness: Business | null = null;

  constructor(
    private router: Router,
    private businessService: BusinessService,
    private alertService: AlertService,
    private userService: UserService,
    private authService: AuthService,
  ) {
    const businessSource$ = this.refreshBusiness$.pipe(
      switchMap(() => this.businessService.findByUser()),
      tap((business) => (this.currentBusiness = business)),
      catchError(() => {
        this.currentBusiness = null;
        return of(null);
      }),
      shareReplay(1),
    );

    this.hasBusiness$ = businessSource$.pipe(map((business) => !!business));
    this.isVerified$ = businessSource$.pipe(
      map((business) => business?.status === BusinessStatus.VERIFIED),
    );

    this.isCollaborator$ = this.userService.getProfile().pipe(
      map((user) => this.authService.isCollaborator(user as User)),
      shareReplay(1),
    );
  }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.refreshBusiness$.next();
    });
  }


  logout(): void {
    this.alertService
      .confirmAction(
        '¿Cerrar Sesión?',
        '¿Estás seguro de que deseas salir?',
        'Cerrar Sesión',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.authService.logout();
          this.router.navigate(['/']);
        }
      });
  }

  deleteBusiness(): void {
    if (!this.currentBusiness?.id) {
      this.alertService.showError('Error', 'No se encontró un negocio activo.');
      return;
    }

    this.alertService
      .confirmAction(
        '¿Eliminar Negocio?',
        'Esta acción eliminará toda la información. No hay vuelta atrás.',
        'Sí, eliminar',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.executeBusinessDeletion();
        }
      });
  }

  private executeBusinessDeletion(): void {
    const businessId = this.currentBusiness?.id;

    if (!businessId) {
      this.alertService.showError('Error', 'No se pudo encontrar el identificador del negocio.');
      return;
    }

    this.businessService.delete(businessId).subscribe({
      next: () => {
        this.currentBusiness = null;
        this.alertService.showSuccess(
          'Negocio Eliminado',
          'Tu negocio ha sido eliminado correctamente. Redirigiendo al registro...',
        );

        this.router.navigate(['/register-business']);
      },
      error: (err) => {
        const msg = err.error?.message || 'Hubo un error al intentar eliminar el negocio.';
        this.alertService.showError('Error', msg);
      },
    });
  }

  deleteAccount(): void {
    this.alertService
      .confirmAction(
        '¿Eliminar cuenta?', 
        'Esta acción es irreversible y se perderá toda tu información vinculada. ¿Deseas continuar?', 
        'Sí, continuar', 
        'Cancelar'
      )
      .then((confirmed) => {
        if (confirmed) {
          this.alertService
            .confirmAction(
              'Doble Verificación', 
              '¿Estás absolutamente seguro de que deseas ELIMINAR tu cuenta permanentemente?', 
              'ELIMINAR CUENTA', 
              'Cancelar'
            )
            .then((secondConfirmed) => {
              if (secondConfirmed) this.executeAccountDeletion();
            });
        }
      });
  }

  private executeAccountDeletion(): void {
    this.userService.deleteAccount().subscribe({
      next: () => {
        this.alertService.showSuccess('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.');
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        const msg = err.error?.message || 'Hubo un error al intentar eliminar la cuenta.';
        this.alertService.showError('Error', msg);
      }
    });
  }
}
