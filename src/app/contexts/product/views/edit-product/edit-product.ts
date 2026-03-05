import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
    selector: 'app-edit-product',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
    templateUrl: './edit-product.html',
    styleUrl: './edit-product.css'
})
export class EditProduct implements OnInit {
    productForm!: FormGroup;
    productId: string | null = null;
    productNotFound: boolean = false;
    isLoading: boolean = false;
    isSaving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
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

        this.route.paramMap.subscribe(params => {
            this.productId = params.get('id');
            if (this.productId) {
                this.loadProductData(this.productId);
            }
        });
    }

    loadProductData(id: string): void {
        this.isLoading = true;
        this.productService.findById(id).subscribe({
            next: (product) => {
                this.productForm.patchValue({
                    name: product.name,
                    description: product.description,
                    measure_unit: product.measure_unit,
                    stock: product.stock
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading product', error);
                this.productNotFound = true;
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.productForm.valid && this.productId) {
            this.isSaving = true;
            this.productService.update(this.productId, this.productForm.value).subscribe({
                next: (updatedProduct) => {
                    console.log('Producto Actualizado:', updatedProduct);
                    this.alertService.showSuccess('¡Actualizado!', 'Producto actualizado exitosamente');
                    this.isSaving = false;
                    this.router.navigate(['/dashboard/products']);
                },
                error: (error) => {
                    console.error('Error updating product', error);
                    this.isSaving = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard/products']);
    }
}
