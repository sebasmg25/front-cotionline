import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
    selector: 'app-register-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
    templateUrl: './register-product.html',
    styleUrl: './register-product.css'
})
export class RegisterProduct implements OnInit {
    productForm!: FormGroup;
    isSaving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private productService: ProductService,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            measure_unit: ['', [Validators.required]],
            stock: ['', [Validators.required, Validators.min(0)]]
        });
    }

    onSubmit(): void {
        if (this.productForm.valid) {
            this.isSaving = true;
            this.productService.save(this.productForm.value).subscribe({
                next: (savedProduct) => {
                    console.log('Nuevo Producto:', savedProduct);
                    this.alertService.showSuccess('¡Guardado!', 'Producto creado exitosamente');
                    this.isSaving = false;
                    this.router.navigate(['/dashboard/products']);
                },
                error: (error) => {
                    console.error('Error saving product', error);
                    this.isSaving = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard/products']);
    }
}
