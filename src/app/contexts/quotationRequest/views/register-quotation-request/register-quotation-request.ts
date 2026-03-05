import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { QuotationRequest, QuotationStatus, QuotationItem } from '../../domain/models/quotation-request.model';
import { Product } from '../../../product/domain/models/product.model';
import { ProductDialog } from '../../../product/views/product-dialog/product-dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Branch } from '../../../branch/domain/models/branch.model';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';

@Component({
  selector: 'app-register-quotation-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './register-quotation-request.html',
  styleUrl: './register-quotation-request.css',
})
export class RegisterQuotationRequest implements OnInit {
  quotationForm: FormGroup;
  isEditMode: boolean = false;
  quotationId: string | null = null;
  currentStatus: QuotationStatus = 'draft';
  isSaving: boolean = false;
  branches: Branch[] = [];

  // Product Search
  productSearchControl: any;
  allProducts: Product[] = [];
  filteredProducts$?: Observable<Product[]>;
  selectedProducts: QuotationItem[] = [];
  showNoResults: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationRequestService,
    private productService: ProductService,
    private branchService: BranchService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {
    this.productSearchControl = this.fb.control('');
    this.quotationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required]],
      branchId: ['', [Validators.required]],
      expirationDate: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadAllProducts();
    this.loadBranches();
    this.quotationId = this.route.snapshot.paramMap.get('id');
    if (this.quotationId) {
      this.isEditMode = true;
      this.loadQuotation(this.quotationId);
    }
  }

  loadBranches(): void {
    this.branchService.findAll().subscribe(branches => {
      this.branches = branches;
    });
  }

  loadAllProducts(): void {
    this.productService.findAll().subscribe(products => {
      this.allProducts = products;
      this.setupProductFilter();
    });
  }

  setupProductFilter(): void {
    this.filteredProducts$ = this.productSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : '';
        const filtered = this.allProducts.filter(p =>
          p.name.toLowerCase().includes(name.toLowerCase())
        );
        this.showNoResults = name.length > 0 && filtered.length === 0;
        return filtered;
      })
    );
  }

  addProduct(product: Product): void {
    const exists = this.selectedProducts.find(p => p.id === product.id);
    if (!exists) {
      this.selectedProducts.push({
        id: product.id!,
        name: product.name,
        quantity: 1,
        description: product.description
      });
    }
    this.productSearchControl.setValue('');
  }

  openProductDialog(initialName?: string): void {
    const dialogRef = this.dialog.open(ProductDialog, {
      width: '500px',
      data: { initialName: initialName || this.productSearchControl.value }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.save(result).subscribe(newProduct => {
          this.allProducts.push(newProduct);
          this.addProduct(newProduct);
          this.alertService.showSuccess('Producto Creado', `${newProduct.name} añadido a la solicitud`);
        });
      }
    });
  }

  editProduct(item: QuotationItem): void {
    // We would fetch the actual product to get unit/stock but for mock we use the item
    const dialogRef = this.dialog.open(ProductDialog, {
      width: '500px',
      data: { product: { ...item, measure_unit: 'Unidad', stock: 0 } as Product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update locally for now
        const index = this.selectedProducts.findIndex(p => p.id === item.id);
        if (index !== -1) {
          this.selectedProducts[index] = { ...this.selectedProducts[index], ...result };
        }
      }
    });
  }

  removeProduct(index: number): void {
    this.selectedProducts.splice(index, 1);
  }

  loadQuotation(id: string): void {
    this.quotationService.findById(id).subscribe(quotation => {
      if (quotation) {
        this.quotationForm.patchValue({
          title: quotation.title,
          description: quotation.description,
          branchId: quotation.branchId,
          expirationDate: quotation.expirationDate
        });
        this.currentStatus = quotation.status;
        this.selectedProducts = [...quotation.items];

        if (this.currentStatus === 'published') {
          this.quotationForm.disable();
          this.productSearchControl.disable();
        }
      }
    });
  }

  saveAsDraft(): void {
    this.processSave('draft', 'Borrador guardado exitosamente');
  }

  publish(): void {
    this.alertService.confirmAction(
      '¿Publicar Solicitud?',
      'Una vez publicada, los proveedores podrán verla y enviar cotizaciones.',
      'Publicar Ahora',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.processSave('published', 'Solicitud publicada exitosamente');
      }
    });
  }

  public processSave(status: QuotationStatus, successMsg: string): void {
    if (this.quotationForm.invalid) return;

    this.isSaving = true;
    const data = {
      ...this.quotationForm.value,
      status,
      createdAt: new Date(),
      items: this.selectedProducts
    };

    if (this.isEditMode && this.quotationId) {
      this.quotationService.update(this.quotationId, data).subscribe({
        next: () => this.handleSuccess(successMsg),
        error: () => this.handleError()
      });
    } else {
      this.quotationService.save(data).subscribe({
        next: () => this.handleSuccess(successMsg),
        error: () => this.handleError()
      });
    }
  }

  duplicate(): void {
    if (!this.quotationId) return;
    this.alertService.confirmAction(
      '¿Duplicar Solicitud?',
      'Se creará una copia como borrador.',
      'Duplicar',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.quotationService.duplicate(this.quotationId!).subscribe(() => {
          this.alertService.showSuccess('Duplicado', 'Solicitud duplicada como borrador');
          this.router.navigate(['/dashboard/quotations']);
        });
      }
    });
  }

  delete(): void {
    if (!this.quotationId) return;
    this.alertService.confirmAction(
      '¿Eliminar Solicitud?',
      'Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar'
    ).then(confirmed => {
      if (confirmed) {
        this.quotationService.delete(this.quotationId!).subscribe(() => {
          this.alertService.showSuccess('Eliminado', 'La solicitud ha sido eliminada');
          this.router.navigate(['/dashboard/quotations']);
        });
      }
    });
  }

  private handleSuccess(msg: string): void {
    this.isSaving = false;
    this.alertService.showSuccess('¡Hecho!', msg);
    this.router.navigate(['/dashboard/quotations']);
  }

  private handleError(): void {
    this.isSaving = false;
    this.alertService.showError('Error', 'No se pudo procesar la solicitud');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/quotations']);
  }
}
