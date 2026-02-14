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
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {}

  email: string = '';
  password: string = '';

  login(): void {
    if (!this.email || !this.password) {
      console.log('Ingrese su correo y contraseña');
      return;
    }
    const credentials = {
      email: this.email,
      password: this.password,
    };

    this.userService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        console.log('RESULTADO', response);
        this.userService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log('Error al iniciar sesión', err);
      },
      complete: () => {
        console.log('Flujo de login completado');
      },
    });
  }
}
