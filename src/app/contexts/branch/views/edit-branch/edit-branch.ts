import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
    selector: 'app-edit-branch',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
    templateUrl: './edit-branch.html',
    styleUrl: './edit-branch.css',
})
export class EditBranch implements OnInit {
    branchForm!: FormGroup;
    branchId: string | null = null;
    branchNotFound: boolean = false;
    isLoading: boolean = false;
    isSaving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private branchService: BranchService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.branchForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            city: ['', [Validators.required]],
            address: ['', [Validators.required]],
            businessId: ['', [Validators.required]] // Keep track of the owner business
        });

        this.route.paramMap.subscribe(params => {
            this.branchId = params.get('id');
            if (this.branchId) {
                this.loadBranchData(this.branchId);
            }
        });
    }

    loadBranchData(id: string): void {
        this.isLoading = true;
        this.branchService.findById(id).subscribe({
            next: (branch) => {
                this.branchForm.patchValue({
                    name: branch.name,
                    city: branch.city,
                    address: branch.address,
                    businessId: branch.businessId
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading branch', error);
                this.branchNotFound = true;
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.branchForm.valid && this.branchId) {
            this.isSaving = true;
            this.branchService.update(this.branchId, this.branchForm.value).subscribe({
                next: (updatedBranch) => {
                    console.log('Sede Actualizada:', updatedBranch);
                    this.alertService.showSuccess('Modificación Exitosa', 'Sede actualizada exitosamente');
                    this.isSaving = false;
                    this.router.navigate(['/dashboard/branches']); // Note: Must match app.routes
                },
                error: (error) => {
                    console.error('Error updating branch', error);
                    this.isSaving = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard/branches']); // Note: Must match app.routes
    }
}
