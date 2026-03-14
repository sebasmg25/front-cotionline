import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { UserService } from '../../../../infraestructure/services/user/user.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  passwordForm: FormGroup;
  hideNew = true;
  hideConfirm = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.passwordForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(12),
            // Sincronizado con tu backend: Mayúscula, Minúscula, Número y Caracter Especial
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  // Validador personalizado para asegurar que ambas coinciden
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { mismatch: true }
      : null;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    const newPassword = this.passwordForm.value.password;

    this.userService.updateProfile({ password: newPassword }).subscribe({
      next: () => {
        this.alertService.showSuccess('Éxito', 'Tu contraseña ha sido actualizada correctamente.');
        this.router.navigate(['/dashboard/profile']);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Error al actualizar la contraseña.';
        this.alertService.showError('Error', errorMsg);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}
