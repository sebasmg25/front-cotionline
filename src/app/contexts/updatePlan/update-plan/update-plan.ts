import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DecimalPipe } from '@angular/common'; // Necesario para formatear el número
import { SubscriptionService } from '../../../infraestructure/services/subscription/subscription.service';
import { WompiService } from '../../../infraestructure/services/payment/wompi.service';
import { AlertService } from '../../shared/services/alert.service';
import { AuthService } from '../../../infraestructure/services/auth/auth.service';

interface PlanPrice {
  id: string;
  name: string;
  monthly: number;
}

@Component({
  selector: 'app-update-plan',
  imports: [MatCardModule, MatIconModule, MatButtonModule, DecimalPipe],
  templateUrl: './update-plan.html',
  styleUrl: './update-plan.css',
})
export class UpdatePlan implements OnInit {
  private readonly PRICE_DATA: PlanPrice[] = [
    {
      id: 'basico',
      name: 'Básico',
      monthly: 20000,
    },
    {
      id: 'premium',
      name: 'Premium',
      monthly: 35000,
    },
  ];

  billingCycle = signal<'mensual'>('mensual');
  isProcessing = signal<boolean>(false);
  currentUserPlanId = signal<string | null>(null);

  constructor(
    private subscriptionService: SubscriptionService,
    private wompiService: WompiService,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.getUserSession().subscribe({
      next: (response) => {
        this.currentUserPlanId.set(response.user?.planId || null);
      },
      error: (err) => {
        console.error('Error fetching user session in UpdatePlan:', err);
      }
    });
  }


  getCurrentPrice(planId: string): number {
    const plan = this.PRICE_DATA.find((p) => p.id === planId);
    return plan ? plan.monthly : 0;
  }

  private readonly PLAN_UUIDS: Record<string, string> = {
    'basico': 'c2c9636d-053c-4ba9-9941-51dd44271c8c',
    'premium': '37879279-47ea-49fb-8c7e-39f48e9b6dcb'
  };

  selectPlan(planId: string): void {
    const planName = this.PRICE_DATA.find(p => p.id === planId)?.name || 'el plan';
    const planUuid = this.PLAN_UUIDS[planId] || planId;

    this.alertService.showInfo('Iniciando pago...', `Preparando pasarela de pagos para ${planName}.`);
    this.isProcessing.set(true);

    this.subscriptionService.initializePayment(planUuid).subscribe({
      next: (paymentData) => {
        this.wompiService.openWidget(paymentData)
          .then((transaction) => {
            this.isProcessing.set(false);
            this.alertService.showSuccess('Pago exitoso', `Tu suscripción a ${planName} ha sido actualizada.`);
            // Recargar para aplicar los nuevos límites en el frontend y renovar token
            setTimeout(() => window.location.reload(), 2000);
          })
          .catch((err) => {
            this.isProcessing.set(false);
            this.alertService.showError('Pago incompleto', err.message || 'No se pudo procesar el pago o fue cancelado.');
          });
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.alertService.showError('Error', err.error?.message || 'No se pudo iniciar el proceso de pago con el servidor.');
      }
    });
  }
}
