import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Business } from '../../domain/models/business.model';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../shared/services/alert.service';
import { of, delay } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Toolbar } from '../../../shared/toolbar/toolbar';

@Component({
  selector: 'app-register-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    Toolbar
  ],
  templateUrl: './register-business.html',
  styleUrl: './register-business.css',
})
export class RegisterBusiness implements OnInit {
  businessForm!: FormGroup;
  isSaving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private businessService: BusinessService,
    private userService: UserService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.businessForm = this.fb.group({
      nit: ['', [Validators.required]],
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      address: ['', [Validators.required]]
    });
  }

  registerBusiness() {
    if (this.businessForm.invalid) {
      this.alertService.showInfo('Formulario incompleto', 'Por favor completa todos los campos del negocio.');
      return;
    }

    this.isSaving = true;

    this.userService.getUserId()?.subscribe({
      next: (response) => {
        const userId = response.user.id;

        const newBusiness: Business = {
          ...this.businessForm.value,
          userId: userId,
        };

        this.businessService.save(newBusiness).subscribe({
          next: (result: Business) => {
            this.alertService.showSuccess('¡Paso 2 completado!', 'Negocio registrado. Procede a cargar los documentos.');
            this.isSaving = false;
            this.router.navigate(['/upload-docs']);
          },
          error: (err) => {
            this.alertService.showError('Error', 'No se pudo registrar el negocio. Inténtalo de nuevo.');
            this.isSaving = false;
            console.error('Error al registrar el negocio:', err);
          }
        });
      },
      error: (err) => {
        this.alertService.showError('Error de Sesión', 'No se pudo recuperar la información del usuario.');
        this.isSaving = false;
      }
    });
  }
}
