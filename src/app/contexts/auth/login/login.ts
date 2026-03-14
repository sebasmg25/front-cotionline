import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../infraestructure/services/auth/auth.service'; // ✅ Cambio: Usar AuthService
import { LoginResponse } from '../../user/domain/user.repository';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true, // Asegúrate de tener esto si es standalone
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
    private authService: AuthService, // ✅ Inyectamos el nuevo servicio
    private router: Router,
    private alertService: AlertService,
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

    // ✅ Usamos el método login de AuthService
    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        // ✅ Guardamos el token en LocalStorage a través del AuthService
        this.authService.saveToken(response.token);
        this.isLoading = false;

        if (this.isDialog && this.dialogRef) {
          this.dialogRef.close(true);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // ✅ Tipado preventivo para TypeScript
        this.isLoading = false;

        // Intentamos extraer el mensaje real del backend (ej: "Usuario no encontrado")
        const errorMessage =
          err.error?.message || 'Correo o contraseña incorrectos. Por favor intenta de nuevo.';
        this.alertService.showError('Error de acceso', errorMessage);

        console.error('Error al iniciar sesión', err);
      },
      complete: () => {
        console.log('Flujo de login completado');
      },
    });
  }
}
