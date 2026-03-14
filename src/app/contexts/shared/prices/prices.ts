import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card'; // <-- Para <mat-card>
import { MatIconModule } from '@angular/material/icon'; // <-- Para <mat-icon>
import { MatButtonModule } from '@angular/material/button'; // <-- Para <button mat-flat-button>

import { Router } from '@angular/router';

@Component({
  selector: 'app-prices',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './prices.html',
  styleUrl: './prices.css',
})
export class Prices {
  constructor(private router: Router) {}

  // Mapa de UUIDs desde la BD del backend
  private readonly PLAN_UUIDS: Record<string, string> = {
    'basico': 'c2c9636d-053c-4ba9-9941-51dd44271c8c',
    'premium': '37879279-47ea-49fb-8c7e-39f48e9b6dcb'
  };

  selectPlan(planId: string): void {
    if (planId === 'basico' || planId === 'premium') {
      localStorage.setItem('pendingSubscriptionPlan', this.PLAN_UUIDS[planId]);
    }
    // Redirigimos al usuario al login, desde el código para atraparlo en el dashboard después
    this.router.navigateByUrl('/login');
  }
}
