import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'; // Importado de @angular/core
import { ReactiveFormsModule, FormsModule } from '@angular/forms'; // Importado de @angular/forms
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { QuotationItem } from '../../domain/models/quotation-request.model';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { Product } from '../../../product/domain/models/product.model';

@Component({
  selector: 'app-quotation-request-item-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './quotation-request-item-products.html',
  styleUrl: './quotation-request-item-products.css',
})
export class QuotationRequestItemProducts implements OnInit {
  private _quotationId: string | null = null;

  // Setter para reaccionar cuando el ID llega desde el Borrador asíncronamente
  @Input() set quotationId(value: string | null) {
    const previousId = this._quotationId;
    this._quotationId = value;

    // Si recibimos un ID válido y es diferente al anterior, cargamos (o recargamos) desde el backend
    if (value && value !== previousId) {
      this.loadSavedProducts();
    }
  }

  get quotationId(): string | null {
    return this._quotationId;
  }

  @Input() mode: 'EDIT' | 'VIEW' = 'EDIT';
  @Input() items: QuotationItem[] = [];
  @Output() itemsChange = new EventEmitter<QuotationItem[]>();
  @Output() productsLoaded = new EventEmitter<void>();

  isLoading: boolean = false;
  private nextRefIndex: number = 1;

  constructor(
    private alertService: AlertService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    // Caso: El ID ya está presente al iniciar (ej. solicitudes publicadas)
    if (this.quotationId) {
      this.loadSavedProducts();
    } else {
      // Caso: Es una solicitud nueva (sin ID aún)
      if (this.mode === 'EDIT' && this.items.length === 0) {
        setTimeout(() => {
          this.addNewRow();
        }, 0);
      }
    }
  }

  /**
   * Carga los productos asociados a la solicitud desde el backend
   */
  loadSavedProducts(): void {
    if (!this.quotationId) return;

    this.isLoading = true;
    this.productService.findAllByQuotationRequest(this.quotationId).subscribe({
      next: (products: Product[]) => {
        if (products && products.length > 0) {
          // Mapeamos Product[] a QuotationItem[]
          this.items = products.map((p, idx) => ({
            id: p.id,
            name: p.name,
            quantity: p.amount || 1,
            description: p.description,
            unitOfMeasurement: p.unitOfMeasurement || '',
            refIndex: idx + 1,
          }));

          this.nextRefIndex = this.items.length + 1;
          this.notifyChange();
        } else if (this.mode === 'EDIT' && this.items.length === 0) {
          this.addNewRow();
        }
        
        this.productsLoaded.emit();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products', error);
        this.isLoading = false;
      },
    });
  }

  asAny(item: any): any {
    return item;
  }

  addNewRow(): void {
    const newItem: any = {
      id: 'temp-' + Date.now(),
      name: '',
      quantity: 1,
      unitOfMeasurement: '',
      description: '',
      refIndex: this.nextRefIndex++, // Índice persistente
    };
    this.items = [...this.items, newItem];
    this.notifyChange();
  }

  cloneRow(item: QuotationItem): void {
    const clonedItem: any = {
      ...item,
      id: 'temp-' + (Date.now() + Math.random()),
      unitOfMeasurement: this.asAny(item).unitOfMeasurement,
      refIndex: this.nextRefIndex++, // Nuevo índice persistente para el clon
    };
    this.items = [...this.items, clonedItem];
    this.notifyChange();
  }

  removeRow(index: number): void {
    const item = this.items[index];

    const doRemove = () => {
      this.items.splice(index, 1);
      this.items = [...this.items];
      this.notifyChange();
      if (this.items.length === 0 && this.mode === 'EDIT') {
        this.addNewRow();
      }
    };

    // Si el item ya existe en la DB, lo eliminamos físicamente
    if (item.id && !item.id.startsWith('temp-')) {
      this.productService.delete(item.id).subscribe({
        next: () => {
          this.alertService.showSuccess('Eliminado', 'Producto quitado de la solicitud');
          doRemove();
        },
        error: () =>
          this.alertService.showError('Error', 'No se pudo eliminar el producto del servidor'),
      });
    } else {
      doRemove();
    }
  }

  notifyChange(): void {
    this.itemsChange.emit(this.items);
  }

  isListValid(): boolean {
    return this.items.every(
      (item) =>
        item.name?.trim() !== '' &&
        item.quantity > 0 &&
        this.asAny(item).unitOfMeasurement?.trim() !== '',
    );
  }


  getRealIndex(item: QuotationItem): number {
    return this.items.indexOf(item);
  }
}
