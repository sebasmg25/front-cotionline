import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { BusinessService } from '../../../infraestructure/services/business/business.service';
import { BusinessStatus } from '../../../contexts/business/domain/models/business.model';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { SubscriptionService, PaymentInitializationResponse } from '../../../infraestructure/services/subscription/subscription.service';
import { WompiService } from '../../../infraestructure/services/payment/wompi.service';
import { AlertService } from '../../../contexts/shared/services/alert.service';

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  templateUrl: './dashboard-summary.html',
  styleUrl: './dashboard-summary.css',
})
export class DashboardSummary implements OnInit {
  public Status = BusinessStatus;
  isVerified$: Observable<boolean> = of(false);
  businessStatus$: Observable<string> = of(BusinessStatus.PENDING);

  menuCards = [
    {
      title: 'Mis Cotizaciones',
      description: 'Gestiona tus cotizaciones enviadas, recibidas y compara propuestas.',
      icon: 'description',
      link: '/dashboard/quotation-management',
      color: '#3f51b5',
    },
    {
      title: 'Mis Solicitudes',
      description: 'Crea, edita y haz seguimiento a tus solicitudes de cotización.',
      icon: 'assignment',
      link: '/dashboard/quotations',
      color: '#009688',
    },
    {
      title: 'Actualizar Plan',
      description: 'Mejora tu suscripción para acceder a funciones avanzadas y límites mayores.',
      icon: 'upgrade',
      link: '/dashboard/updatePlan',
      color: '#ff9800',
    },
  ];

  constructor(
    private businessService: BusinessService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private wompiService: WompiService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    const business$ = this.businessService.findByUser().pipe(
      tap((business) => {
        // CORRECCIÓN CRÍTICA: Si al entrar al dashboard no existe negocio,
        // redirigimos inmediatamente al registro.
        if (!business) {
          this.router.navigate(['/register-business']);
        }
      }),
      catchError(() => {
        this.router.navigate(['/register-business']);
        return of(null);
      }),
      shareReplay(1),
    );

    this.businessStatus$ = business$.pipe(
      map((b) => (b?.status as string) || BusinessStatus.PENDING),
    );

    this.isVerified$ = this.businessStatus$.pipe(
      map((status) => status === BusinessStatus.VERIFIED),
      tap((isVerified) => {
        if (isVerified) {
          this.checkPendingSubscription();
        }
      })
    );
  }

  private checkPendingSubscription(): void {
    const pendingPlan = localStorage.getItem('pendingSubscriptionPlan');
    if (pendingPlan) {
      // Remover para no ciclar el pago si recarga la página
      localStorage.removeItem('pendingSubscriptionPlan');
      
      this.alertService.showInfo('Iniciando pago...', 'Preparando la pasarela de pago para tu plan seleccionado.');
      
      this.subscriptionService.initializePayment(pendingPlan).subscribe({
        next: (paymentData: PaymentInitializationResponse) => {
          this.wompiService.openWidget(paymentData)
            .then((transaction: any) => {
               this.alertService.showSuccess('Pago exitoso', 'Tu pago ha sido procesado. Pendiente de verificación por Webhook.');
               // Aquí podríamos recargar el estado del usuario o redirigirlo,
               // por ahora simplemente recargamos la página o dejamos que disfrute.
               setTimeout(() => window.location.reload(), 2000);
            })
            .catch((err: any) => {
               this.alertService.showError('Pago incompleto', err.message || 'No se pudo completar el pago.');
            });
        },
        error: (err: any) => {
          this.alertService.showError('Error', err.error?.message || 'No se pudo inicializar el pago.');
        }
      });
    }
  }
}
