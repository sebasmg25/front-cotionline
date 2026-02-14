import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CITIES } from '../../shared/data/cities.data';
import { User } from '../../user/domain/models/user.model';
import { UserService } from '../../../infraestructure/services/user/user.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../../user/domain/user.repository';

@Component({
  selector: 'app-register',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  constructor(private userService: UserService, private router: Router) {}
  identification: string = '';
  name: string = '';
  lastName: string = '';
  email: string = '';
  city: string = '';
  password: string = '';
  confirmPassword: string = '';

  ngOnInit(): void {}

  resetForm() {
    this.identification = '';
    this.name = '';
    this.lastName = '';
    this.email = '';
    this.city = '';
    this.password = '';
    this.confirmPassword = '';
  }

  isPasswordValid(): boolean {
    return this.password === this.confirmPassword && this.password.length > 0;
  }

  registerUser() {
    if (!this.isPasswordValid()) {
      console.log('Las contraseñas no coinciden');
      return;
    }

    const newUser: User = {
      identification: this.identification,
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      city: this.city,
      password: this.password,
    };

    console.log('DATOS ENVIADOOOOOOOOOS');

    this.userService.save(newUser).subscribe({
      next: (response) => {
        this.userService.saveToken(response.token);
        console.log('TOKEEEEEEEEN DE REGISTRO', response.token);
        this.resetForm();
        this.router.navigate(['/dashboard']);
        console.log('Usuario registrado exitosamente');
      },
      error(err) {
        if (err.error) {
          console.error('Detalle de la validación del backend:', err.error);
        } else {
          console.error('Error general:', err);
        }
      },
      complete() {
        console.log('Fin de la operación');
      },
    });
  }
}
