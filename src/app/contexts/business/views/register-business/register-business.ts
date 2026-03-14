import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { Router } from '@angular/router';
import { AlertService } from '../../../shared/services/alert.service';
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
    Toolbar,
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
    private router: Router,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.businessForm = this.fb.group({
      nit: ['', [Validators.required, Validators.minLength(5)]], // Coherente con EditBusiness
      name: ['', [Validators.required, Validators.minLength(3)]], // Coherente con EditBusiness
      description: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  registerBusiness(): void {
    if (this.businessForm.invalid) {
      this.alertService.showInfo(
        'Formulario incompleto',
        'Por favor completa todos los campos del negocio.',
      );
      return;
    }

    this.isSaving = true;

    // Enviamos un JSON simple al backend (Paso 2)
    // El interceptor pondrá el Token automáticamente
    this.businessService.save(this.businessForm.value).subscribe({
      next: (savedBusiness) => {
        this.alertService.showSuccess('¡Paso 2 completado!', 'Datos del negocio registrados.');
        this.isSaving = false;

        // Guardamos el ID en localStorage para que el Paso 3 sepa a quién subirle los archivos
        if (savedBusiness.id) {
          localStorage.setItem('pendingBusinessId', savedBusiness.id);
        }

        this.router.navigate(['/upload-docs']);
      },
      error: (err: any) => {
        this.isSaving = false;
        const errorMsg = err.error?.message || 'No se pudo registrar el negocio.';
        this.alertService.showError('Error', errorMsg);
        console.error('Error al registrar el negocio:', err);
      },
    });
  }
}
