import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../domain/models/product.model';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.product ? 'Editar Producto' : 'Crear Nuevo Producto' }}
      <button mat-icon-button (click)="onCancel()" class="close-button">
        <mat-icon>close</mat-icon>
      </button>
    </h2>
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del Producto</mat-label>
          <input matInput formControlName="name" placeholder="Ej. Papel Bond A4" required />
          <mat-icon matPrefix>inventory_2</mat-icon>
        </mat-form-field>
  
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Detalles del producto..."></textarea>
          <mat-icon matPrefix>description</mat-icon>
        </mat-form-field>
  
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Unidad de Medida</mat-label>
            <input matInput formControlName="measure_unit" placeholder="Ej. Resma, Unidad" required />
            <mat-icon matPrefix>straighten</mat-icon>
          </mat-form-field>
  
          <mat-form-field appearance="outline">
            <mat-label>Stock Inicial</mat-label>
            <input matInput type="number" formControlName="stock" placeholder="0" required />
            <mat-icon matPrefix>inventory</mat-icon>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" class="secondary-button">CANCELAR</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="productForm.invalid" class="save-button">
        {{ data.product ? 'ACTUALIZAR' : 'AGREGAR A SOLICITUD' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form { display: flex; flex-direction: column; padding: 10px 0; }
    .full-width { width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .close-button { color: #888; }
    .save-button { height: 48px !important; padding: 0 24px !important; font-weight: 700 !important; border-radius: 12px !important; }
    .secondary-button { font-weight: 600 !important; color: #666 !important; }
  `]
})
export class ProductDialog implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product, initialName?: string }
  ) {
    this.productForm = this.fb.group({
      name: [data.initialName || '', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      measure_unit: ['', [Validators.required]],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data.product) {
      this.productForm.patchValue(this.data.product);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }
}
