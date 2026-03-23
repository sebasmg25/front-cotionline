import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../infraestructure/services/auth/auth.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>lock_reset</mat-icon>
      Recuperar Contraseña
    </h2>
    
    <mat-dialog-content class="dialog-content">
      <p class="instruction-text">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
      </p>
      
      <form [formGroup]="forgotForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo Electrónico</mat-label>
          <input matInput formControlName="email" type="email" placeholder="ejemplo@correo.com">
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="forgotForm.get('email')?.hasError('required')">El correo es obligatorio</mat-error>
          <mat-error *ngIf="forgotForm.get('email')?.hasError('email')">Ingresa un correo válido</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="isLoading">CANCELAR</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="forgotForm.invalid || isLoading">
        <mat-spinner diameter="20" *ngIf="isLoading" style="display: inline-block; margin-right: 8px;"></mat-spinner>
        ENVIAR ENLACE
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 10px; color: var(--primary-dark); font-weight: 700; }
    .dialog-title mat-icon { color: var(--accent-blue); font-size: 28px; width: 28px; height: 28px; }
    .dialog-content { padding-top: 10px !important; }
    .instruction-text { color: #666; margin-bottom: 20px; line-height: 1.5; font-size: 14px; }
    .full-width { width: 100%; }
    ::ng-deep .mat-mdc-dialog-container { border-radius: 16px !important; }
  `]
})
export class ForgotPasswordDialog {
  forgotForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ForgotPasswordDialog>,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      const email = this.forgotForm.get('email')?.value;
      
      this.authService.forgotPassword(email).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.alertService.showSuccess('Correo Enviado', res.message || 'Revisa tu bandeja de entrada.');
          this.dialogRef.close();
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'No se pudo procesar la solicitud.';
          this.alertService.showError('Error', msg);
        }
      });
    }
  }
}
