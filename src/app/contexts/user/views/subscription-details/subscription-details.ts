import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

interface SubscriptionInfo {
    planName: string;
    price: number;
    billingCycle: 'mensual' | 'anual';
    nextBillingDate: Date;
    paymentMethod: string;
}

@Component({
    selector: 'app-subscription-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        RouterModule
    ],
    templateUrl: './subscription-details.html',
    styleUrl: './subscription-details.css'
})
export class SubscriptionDetails implements OnInit {
    subscription: SubscriptionInfo = {
        planName: 'Premium',
        price: 35000,
        billingCycle: 'mensual',
        nextBillingDate: new Date(Date.now() + 86400000 * 15), // 15 days from now
        paymentMethod: 'Visa termina en 4242'
    };

    constructor(
        private router: Router,
        private alertService: AlertService
    ) { }

    ngOnInit(): void { }

    changePlan(): void {
        this.router.navigate(['/dashboard/updatePlan']);
    }

    changePaymentMethod(): void {
        this.alertService.confirmAction(
            'Cambiar Método de Pago',
            'Serás redirigido a nuestra pasarela de pagos segura para actualizar tus datos bancarios.',
            'IR A PAGOS',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.alertService.showInfo('Redirigiendo...', 'Conectando con la pasarela de pagos...');
                // Simulate redirect or modal
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard/profile']);
    }
}
