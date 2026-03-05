import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-welcome-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      ¡Bienvenido a CotiOnline!
      <button mat-icon-button (click)="onSkip()" class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content>
      <div class="welcome-container">
        <div class="welcome-icon">
          <mat-icon>celebration</mat-icon>
        </div>
        <p class="welcome-lead">Estamos emocionados de tenerte aquí.</p>
        <p>CotiOnline te ayudará a gestionar tus solicitudes y cotizaciones de manera eficiente y profesional.</p>
        <p class="tour-invite">¿Te gustaría realizar un breve tour guiado para conocer las funciones principales?</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="center">
      <button mat-button (click)="onSkip()" class="secondary-button">EXPLORAR POR MI CUENTA</button>
      <button mat-raised-button color="primary" (click)="onStartTour()" class="tour-button">
        EMPEZAR TOUR
        <mat-icon>play_arrow</mat-icon>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .welcome-container { text-align: center; padding: 10px 0; }
    .welcome-icon { margin-bottom: 20px; }
    .welcome-icon mat-icon { font-size: 80px; width: 80px; height: 80px; color: var(--accent-blue); }
    .welcome-lead { font-size: 18px; font-weight: 700; color: var(--primary-dark); margin-bottom: 15px; }
    .tour-invite { margin-top: 20px; font-weight: 600; color: var(--primary-dark); }
    .close-button { color: #888; }
    .tour-button { height: 50px !important; padding: 0 30px !important; font-weight: 700 !important; border-radius: 14px !important; }
    .secondary-button { color: #666 !important; font-weight: 600 !important; }
  `]
})
export class WelcomeDialog {
  constructor(public dialogRef: MatDialogRef<WelcomeDialog>) { }

  onSkip(): void {
    this.dialogRef.close(false);
  }

  onStartTour(): void {
    this.dialogRef.close(true);
  }
}
