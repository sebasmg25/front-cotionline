import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../infraestructure/services/auth/auth.service';
import { AlertService } from '../../../contexts/shared/services/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="reset-container">
      <mat-card class="reset-card">
        <div class="header">
          <div class="logo-container">
            <span class="logo-text">✦ CotiOnline</span>
          </div>
          <h1 class="title">Restablecer Contraseña</h1>
          <p class="subtitle">Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.</p>
        </div>

        <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nueva Contraseña</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="resetForm.get('password')?.hasError('required')">La contraseña es obligatoria</mat-error>
            <mat-error *ngIf="resetForm.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmar Contraseña</mat-label>
            <input matInput [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword">
            <button mat-icon-button matSuffix (click)="hideConfirm = !hideConfirm" type="button">
              <mat-icon>{{hideConfirm ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="resetForm.get('confirmPassword')?.hasError('required')">Confirma tu contraseña</mat-error>
            <mat-error *ngIf="resetForm.hasError('mismatch')">Las contraseñas no coinciden</mat-error>
          </mat-form-field>

          <button mat-raised-button color="primary" class="submit-button" [disabled]="resetForm.invalid || !token || !userId || isLoading">
            <mat-spinner diameter="20" *ngIf="isLoading" style="display: inline-block; margin-right: 8px;"></mat-spinner>
            ACTUALIZAR CONTRASEÑA
          </button>
        </form>

        <div class="footer">
          <a routerLink="/login" class="back-link">
            <mat-icon>arrow_back</mat-icon>
            Volver al inicio de sesión
          </a>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .reset-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      padding: 20px;
    }
    .reset-card {
      width: 100%;
      max-width: 450px;
      padding: 40px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header { text-align: center; margin-bottom: 30px; }
    .logo-container { margin-bottom: 20px; }
    .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
    .title { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .subtitle { color: #64748b; font-size: 14px; line-height: 1.5; }
    .full-width { width: 100%; margin-bottom: 15px; }
    .submit-button { width: 100%; height: 50px; border-radius: 12px; font-weight: 600; font-size: 15px; margin-top: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6) !important; color: white !important; }
    .footer { margin-top: 25px; text-align: center; }
    .back-link { display: inline-flex; align-items: center; gap: 8px; color: #6366f1; text-decoration: none; font-weight: 600; font-size: 14px; transition: color 0.2s; }
    .back-link:hover { color: #4f46e5; }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  token: string | null = null;
  userId: string | null = null;
  isLoading: boolean = false;
  hidePassword = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.userId = this.route.snapshot.queryParamMap.get('id');

    if (!this.token || !this.userId) {
      this.alertService.showError('Error', 'El enlace de recuperación es inválido o ha expirado.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.resetForm.valid && this.token && this.userId) {
      this.isLoading = true;
      const data = {
        userId: this.userId,
        token: this.token,
        newPassword: this.resetForm.get('password')?.value
      };

      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.isLoading = false;
          this.alertService.showSuccess('Éxito', 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Hubo un error al actualizar la contraseña.';
          this.alertService.showError('Error', msg);
        }
      });
    }
  }
}
