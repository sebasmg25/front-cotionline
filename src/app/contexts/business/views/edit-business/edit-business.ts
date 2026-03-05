import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
    selector: 'app-edit-business',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
    templateUrl: './edit-business.html',
    styleUrl: './edit-business.css',
})
export class EditBusiness implements OnInit {
    businessForm!: FormGroup;
    businessId: string | null = null;
    businessNotFound: boolean = false;
    isLoading: boolean = false;
    isSaving: boolean = false;
    currentBusiness: any = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private businessService: BusinessService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.businessForm = this.fb.group({
            nit: ['', [Validators.required, Validators.minLength(5)]],
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            address: ['', [Validators.required]],
            userId: [''] // Or handle the association in another way
        });

        this.route.paramMap.subscribe(params => {
            // In a real app, we would get the business linked to the current user.
            // For now, we default to the first mock business '1'.
            this.businessId = params.get('id') || '1';
            if (this.businessId) {
                this.loadBusinessData(this.businessId);
            }
        });
    }

    loadBusinessData(id: string): void {
        this.isLoading = true;
        this.businessService.findById(id).subscribe({
            next: (business) => {
                this.currentBusiness = business;
                this.businessForm.patchValue({
                    nit: business.nit,
                    name: business.name,
                    description: business.description,
                    address: business.address,
                    userId: business.userId
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading business', error);
                this.businessNotFound = true;
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.businessForm.valid && this.businessId) {
            this.isSaving = true;
            this.businessService.update(this.businessId, this.businessForm.value).subscribe({
                next: (updatedBusiness) => {
                    console.log('Empresa Actualizada:', updatedBusiness);
                    this.alertService.showSuccess('¡Completado!', 'Información de negocio actualizada');
                    this.isSaving = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    console.error('Error updating business', error);
                    this.isSaving = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard']);
    }
}
