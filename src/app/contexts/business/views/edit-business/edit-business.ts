import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider'; // Importación necesaria

import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { Business } from '../../domain/models/business.model';

@Component({
  selector: 'app-edit-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDividerModule,
  ],
  templateUrl: './edit-business.html',
  styleUrl: './edit-business.css',
})
export class EditBusiness implements OnInit {
  businessForm!: FormGroup;
  currentBusiness: Business | null = null;
  businessNotFound: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private businessService: BusinessService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadBusinessData();
  }

  private initForm(): void {
    this.businessForm = this.fb.group({
      nit: ['', [Validators.required, Validators.minLength(5)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      address: ['', [Validators.required]],
    });
  }

  loadBusinessData(): void {
    this.isLoading = true;
    this.businessService.findByUser().subscribe({
      next: (business) => {
        if (business) {
          this.currentBusiness = business;
          this.businessForm.patchValue({
            nit: business.nit,
            name: business.name,
            description: business.description,
            address: business.address,
          });
        } else {
          this.businessNotFound = true;
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading business', err);
        this.businessNotFound = true;
        this.isLoading = false;
        this.alertService.showError('Error', err.error?.message || 'No se pudo cargar la información de tu negocio.');
      },
    });
  }

  onSubmit(): void {
    if (this.businessForm.invalid) return;

    this.isSaving = true;
    const businessData = this.businessForm.value;

    if (this.currentBusiness?.id) {
      this.businessService.update(this.currentBusiness.id, businessData).subscribe({
        next: () => {
          this.alertService.showSuccess('¡Éxito!', 'Información del negocio actualizada.');
          this.isSaving = false;
          this.loadBusinessData();
        },
        error: (err: any) => {
          this.isSaving = false;
          const errorMsg = err.error?.message || 'Error al actualizar el negocio.';
          this.alertService.showError('Error', errorMsg);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
