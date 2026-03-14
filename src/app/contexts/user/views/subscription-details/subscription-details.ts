import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { AuthService } from '../../../../infraestructure/services/auth/auth.service';
import { SubscriptionService } from '../../../../infraestructure/services/subscription/subscription.service';
import { Plan, PlanName } from '../../../../infraestructure/services/subscription/plan.model';
import { forkJoin } from 'rxjs';

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
    currentPlan: Plan | null = null;
    isLoading = true;

    constructor(
        private router: Router,
        private alertService: AlertService,
        private authService: AuthService,
        private subscriptionService: SubscriptionService
    ) { }

    ngOnInit(): void {
        this.loadSubscriptionData();
    }

    public loadSubscriptionData(): void {
        this.isLoading = true;
        
        forkJoin({
            session: this.authService.getUserSession(),
            plans: this.subscriptionService.getPlans()
        }).subscribe({
            next: ({ session, plans }) => {
                const userPlanId = session.user?.planId;
                this.currentPlan = plans.find(p => p.id === userPlanId) || plans.find(p => p.name === PlanName.FREE) || null;
                this.isLoading = false;
            },
            error: (err) => {
                this.alertService.showError('Error', 'No se pudo cargar la información de tu suscripción.');
                this.isLoading = false;
            }
        });
    }

    changePlan(): void {
        this.router.navigate(['/dashboard/updatePlan']);
    }

    goBack(): void {
        this.router.navigate(['/dashboard/profile']);
    }
}
