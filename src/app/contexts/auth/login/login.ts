import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../infraestructure/services/auth/auth.service';
import { LoginResponse } from '../../user/domain/user.repository';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Optional } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AlertService } from '../../shared/services/alert.service';
import { ForgotPasswordDialog } from './forgot-password-dialog/forgot-password-dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    Toolbar,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isDialog: boolean = false;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private dialog: MatDialog,
    @Optional() private dialogRef: MatDialogRef<Login>,
  ) {
    this.isDialog = !!this.dialogRef;
  }

  ngOnInit(): void {}

  email: string = '';
  password: string = '';

  login(): void {
    if (!this.email || !this.password) {
      this.alertService.showInfo('Datos incompletos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    this.isLoading = true;
    const credentials = {
      email: this.email,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.authService.saveToken(response.token);
        this.isLoading = false;

        if (this.isDialog && this.dialogRef) {
          this.dialogRef.close(true);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;

        const errorMessage =
          err.error?.message || 'Correo o contraseña incorrectos. Por favor intenta de nuevo.';
        this.alertService.showError('Error de acceso', errorMessage);

        console.error('Error al iniciar sesión', err);
      },
      complete: () => {
      },
    });
  }

  openForgotPassword(): void {
    this.dialog.open(ForgotPasswordDialog, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false
    });
  }
}
