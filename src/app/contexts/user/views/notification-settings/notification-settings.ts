import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notification-settings',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule],
    template: `
    <mat-card class="placeholder-card">
      <mat-card-header>
        <mat-card-title>Ajustes de Notificaciones</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Aquí podrás configurar cómo recibes tus cotizaciones. Próximamente.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-flat-button color="primary" (click)="goBack()">Volver</button>
      </mat-card-actions>
    </mat-card>
  `,
    styles: [`
    .placeholder-card { max-width: 500px; margin: 20px auto; text-align: center; padding: 20px; }
  `]
})
export class NotificationSettings {
    constructor(private router: Router) { }
    goBack() { this.router.navigate(['/dashboard']); }
}
