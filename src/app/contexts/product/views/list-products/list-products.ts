import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '../../domain/models/product.model';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-list-products',
    standalone: true,
    imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
    templateUrl: './list-products.html',
    styleUrl: './list-products.css'
})
export class ListProducts implements OnInit {
    products: Product[] = [];
    displayedColumns: string[] = ['name', 'measure_unit', 'stock', 'actions'];

    isLoading: boolean = true;

    constructor(
        private router: Router,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.findAll().subscribe({
            next: (data) => {
                this.products = data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading products', error);
                this.isLoading = false;
            }
        });
    }

    deleteProduct(id: string): void {
        if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            this.productService.delete(id).subscribe({
                next: () => {
                    this.loadProducts(); // Reload the list after deletion
                },
                error: (error) => console.error('Error deleting product', error)
            });
        }
    }

    editProduct(id: string): void {
        this.router.navigate(['/dashboard/products/edit', id]);
    }

    createProduct(): void {
        this.router.navigate(['/dashboard/products/register']);
    }
}
