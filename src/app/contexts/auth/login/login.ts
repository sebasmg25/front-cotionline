import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Añadido para manejo futuro de formularios
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog'; // 👈 ¡ESTO ES LO QUE FALTABA!
import { UserService } from '../../../infraestructure/services/user/user.service';
import { LoginResponse } from '../../user/domain/user.repository';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Toolbar } from '../../shared/toolbar/toolbar';
import { Optional, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-login',
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
    Toolbar
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  isDialog: boolean = false;
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private alertService: AlertService,
    @Optional() private dialogRef: MatDialogRef<Login>
  ) {
    this.isDialog = !!this.dialogRef;
  }

  ngOnInit(): void { }

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

    this.userService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.userService.saveToken(response.token);
        this.isLoading = false;

        if (this.isDialog) {
          this.dialogRef.close(true);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.showError('Error de acceso', 'Correo o contraseña incorrectos. Por favor intenta de nuevo.');
        console.error('Error al iniciar sesión', err);
      },
      complete: () => {
        console.log('Flujo de login completado');
      },
    });
  }
}
