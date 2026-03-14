import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Product } from '../../domain/models/product.model';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
  ],
  templateUrl: './list-products.html',
  styleUrl: './list-products.css',
})
export class ListProducts implements OnInit {
  products: Product[] = [];
  displayedColumns: string[] = ['name', 'unitOfMeasurement', 'amount', 'actions'];
  isLoading: boolean = true;
  quotationRequestId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    // Obtenemos el ID de la solicitud desde la ruta (ej: /quotation-request/:quotationRequestId/products)
    this.quotationRequestId = this.route.snapshot.paramMap.get('quotationRequestId');

    if (this.quotationRequestId) {
      this.loadProducts();
    } else {
      this.isLoading = false;
      this.alertService.showError('Error', 'No se especificó una solicitud de cotización válida.');
      this.router.navigate(['/dashboard/quotations']);
    }
  }

  loadProducts(): void {
    if (!this.quotationRequestId) return;

    this.isLoading = true;
    this.productService.findAllByQuotationRequest(this.quotationRequestId).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.alertService.showError(
          'Error',
          'No se pudieron cargar los productos de esta solicitud.',
        );
        this.isLoading = false;
      },
    });
  }

  deleteProduct(id: string): void {
    this.alertService
      .confirmAction(
        '¿Eliminar producto?',
        'Esta acción no se puede deshacer.',
        'Eliminar',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.productService.delete(id).subscribe({
            next: () => {
              this.alertService.showSuccess('Eliminado', 'Producto eliminado con éxito');
              this.loadProducts();
            },
            error: (error) => {
              this.alertService.showError('Error', 'No se pudo eliminar el producto');
              console.error('Error deleting product', error);
            },
          });
        }
      });
  }

  editProduct(id: string): void {
    this.router.navigate(['/dashboard/products/edit', id]);
  }

  createProduct(): void {
    // Si tenemos el ID de la solicitud, lo pasamos al registro
    if (this.quotationRequestId) {
      this.router.navigate([
        '/dashboard/products/register',
        { quotationRequestId: this.quotationRequestId },
      ]);
    }
  }
}
