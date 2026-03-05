import { Component, Input, Output, EventEmitter } from '@angular/core';

// Angular Material Imports
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessService } from '../../../infraestructure/services/business/business.service';
import { Business } from '../../../contexts/business/domain/models/business.model';
import { AlertService } from '../../shared/services/alert.service';

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
    MatExpansionModule
  ],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {
  @Input() isMobile: boolean = false;
  @Output() closeSidenav = new EventEmitter<void>();

  hasBusiness$: Observable<boolean>;

  constructor(
    private router: Router,
    private businessService: BusinessService,
    private alertService: AlertService
  ) {
    this.hasBusiness$ = this.businessService.findAll().pipe(
      map((businesses: Business[]) => businesses && businesses.length > 0)
    );
  }

  updatePlanDashboard(): void {
    this.router.navigate(['/dashboard/updatePlan']);
  }

  logout(): void {
    this.alertService.confirmAction(
      '¿Cerrar Sesión?',
      '¿Estás seguro de que deseas salir de la aplicación?',
      'Cerrar Sesión',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.router.navigate(['/']);
      }
    });
  }

  deleteAccount(): void {
    this.alertService.confirmAction(
      '¡Atención!',
      '¿Realmente deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      'Eliminar Cuenta',
      'Mantener Cuenta'
    ).then(confirmed => {
      if (confirmed) {
        this.alertService.showSuccess('Cuenta Eliminada', 'Tu cuenta ha sido eliminada correctamente.');
        this.router.navigate(['/']);
      }
    });
  }

  deleteBusiness(): void {
    this.alertService.confirmAction(
      '¡Atención!',
      '¿Estás seguro de que deseas eliminar la información de tu negocio?',
      'Eliminar Negocio',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.alertService.showSuccess('Negocio Eliminado', 'La información del negocio ha sido eliminada.');
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
