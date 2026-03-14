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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';

// Servicios
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { ProductService } from '../../../../infraestructure/services/product/product.service';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

// Modelos y Componentes
import {
  QuotationStatus,
  QuotationItem,
  QuotationRequest,
} from '../../domain/models/quotation-request.model';
import { Branch } from '../../../branch/domain/models/branch.model';
import { Product } from '../../../product/domain/models/product.model';
import { QuotationRequestItemProducts } from '../quotation-request-item-products/quotation-request-item-products';

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
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
    QuotationRequestItemProducts,
  ],
  templateUrl: './register-quotation-request.html',
  styleUrl: './register-quotation-request.css',
})
export class RegisterQuotationRequest implements OnInit {
  quotationForm: FormGroup;
  isEditMode: boolean = false;
  quotationId: string | null = null;
  currentStatus: QuotationStatus = 'DRAFT';
  isSaving: boolean = false;
  branches: Branch[] = [];
  isLoadingBranches: boolean = false;
  minDate: Date;

  navigationOrigin: string | null = null;
  selectedProducts: QuotationItem[] = [];

  initialFormHash: string = '';
  initialProductsHash: string = '';
  isProductsLoaded: boolean = false;

  onProductsChange(items: QuotationItem[]): void {
    this.selectedProducts = items;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationRequestService,
    private productService: ProductService,
    private branchService: BranchService,
    private businessService: BusinessService,
    private userService: UserService,
    private alertService: AlertService,
  ) {
    this.quotationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: [''], 
      branch: ['', [Validators.required]],
      responseDeadline: [null, [Validators.required, (control: any) => {
        if (!control.value) return null;
        const selected = new Date(control.value);
        selected.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return selected.getTime() > today.getTime() ? null : { minDate: true };
      }]],
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow;
  }

  ngOnInit(): void {
    this.loadBranches();

    // Capturamos el origen de la navegación
    this.route.queryParamMap.subscribe((params) => {
      this.navigationOrigin = params.get('origin');
    });

    // Usamos paramMap para reaccionar a cambios en el ID de la URL de forma reactiva
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        // Siempre cargamos las sedes primero
        return this.loadBranches().pipe(
          map(branches => ({ id, branches }))
        );
      })
    ).subscribe((res: any) => {
      const { id } = res;
      if (id) {
        this.quotationId = id;
        this.isEditMode = true;
        this.loadQuotation(id);
      }
    });
  }

  loadBranches(): any {
    this.isLoadingBranches = true;
    return this.businessService
      .findByUser()
      .pipe(
        switchMap((business) => {
          if (!business) return of({ branches: [], business: null, user: null });
          return forkJoin({
            branches: this.branchService.findAllByBusiness(business.id!),
            user: this.userService.getProfile()
          }).pipe(
            map(({ branches, user }) => ({ branches, business, user }))
          );
        }),
        catchError(() => {
          this.alertService.showError('Error', 'No se pudieron cargar las sedes.');
          return of({ branches: [], business: null, user: null });
        }),
        map(({ branches, business, user }) => {
          if (business?.id && user) {
            const branchName = `Sede principal (${user.department}, ${user.city} - ${business.address || 'Sin dirección'})`;
            const defaultBranch = {
              id: 'principal',
              name: branchName,
              department: user.department,
              city: user.city,
              address: business.address || 'Principal',
              businessId: business.id
            } as Branch;

            // Formatear las sedes secundarias para que luzcan igual a la principal
            const formattedBranches = branches.map(b => ({
              ...b,
              name: `${b.name} (${user.department}, ${b.city} - ${b.address || 'Sin dirección'})`
            })) as Branch[];

            this.branches = [defaultBranch, ...formattedBranches];
          } else {
            this.branches = branches;
          }

          if (this.branches.length === 1 && !this.quotationForm.get('branch')?.value) {
            this.quotationForm.get('branch')?.setValue(this.branches[0].id);
          }
          
          this.isLoadingBranches = false;
          return this.branches;
        })
      );
  }

  loadQuotation(id: string): void {
    this.quotationService.findById(id).subscribe((quotation) => {
      if (quotation) {
        let branchValue =
          typeof quotation.branch === 'object' ? (quotation.branch as any).id : quotation.branch;
        
        // Normalización específica para la sede principal de legado/automatica
        if (branchValue === 'sede-principal-automatica') {
          branchValue = 'principal';
        }

        this.quotationForm.patchValue({
          title: quotation.title,
          description: quotation.description,
          branch: branchValue,
          responseDeadline: quotation.responseDeadline,
        });

        this.currentStatus = quotation.status;

        if (this.currentStatus !== 'DRAFT') {
          this.quotationForm.disable();
        }

        // Ya no llamamos aquí a updateInitialHash porque los productos
        // pueden estar cargándose asíncronamente en el componente hijo
      }
    });
  }

  // Nuevo método para recibir la señal de que los productos iniciales se cargaron
  onProductsLoaded(): void {
    if (!this.initialFormHash) {
      this.updateInitialHash();
    }
  }

  private updateInitialHash(): void {
    const formValues = this.quotationForm.getRawValue();
    const productsData = this.selectedProducts.map(p => ({
      name: p.name?.trim().toLowerCase() || '',
      quantity: p.quantity,
      unit: p.unitOfMeasurement?.trim().toLowerCase() || '',
      description: p.description?.trim().toLowerCase() || ''
    }));
    
    this.initialFormHash = JSON.stringify({
      title: formValues.title?.trim().toLowerCase() || '',
      description: formValues.description?.trim().toLowerCase() || '',
      branch: formValues.branch,
      responseDeadline: formValues.responseDeadline ? new Date(formValues.responseDeadline).getTime() : null,
      products: productsData
    });
  }

  get hasChanges(): boolean {
    if (!this.initialFormHash) return false;
    
    const formValues = this.quotationForm.getRawValue();
    const productsData = this.selectedProducts.map(p => ({
      name: p.name?.trim().toLowerCase() || '',
      quantity: p.quantity,
      unit: p.unitOfMeasurement?.trim().toLowerCase() || '',
      description: p.description?.trim().toLowerCase() || ''
    }));

    const currentHash = JSON.stringify({
      title: formValues.title?.trim().toLowerCase() || '',
      description: formValues.description?.trim().toLowerCase() || '',
      branch: formValues.branch,
      responseDeadline: formValues.responseDeadline ? new Date(formValues.responseDeadline).getTime() : null,
      products: productsData
    });

    return this.initialFormHash !== currentHash;
  }

  saveAsDraft(): void {
    // Validar sede explícitamente (por si el valor no coincide con las opciones)
    const branchId = this.quotationForm.get('branch')?.value;
    const branchExists = this.branches.find(b => b.id === branchId);
    
    if (this.quotationForm.invalid || !branchExists) {
      this.quotationForm.markAllAsTouched();
      this.alertService.showWarning('Sede inválida', 'Debes seleccionar una sede responsable de la lista.');
      return;
    }

    if (!this.isListValid()) {
      const names = this.selectedProducts.map(p => p.name.trim().toLowerCase());
      const hasDuplicates = names.length !== new Set(names).size;

      if (hasDuplicates) {
        this.alertService.showWarning('Productos Duplicados', 'No puedes tener dos productos con el mismo nombre en la misma solicitud.');
      } else {
        this.alertService.showWarning(
          'Productos obligatorios',
          'Debes agregar al menos un producto y completar todos sus campos requeridos.',
        );
      }
      return;
    }

    /* Duplicate name check removed at user request */


    this.processSave('DRAFT', 'Borrador guardado exitosamente');
  }

  publish(): void {
    // Validar sede explícitamente
    const branchId = this.quotationForm.get('branch')?.value;
    const branchExists = this.branches.find(b => b.id === branchId);

    if (this.quotationForm.invalid || !branchExists) {
      this.quotationForm.markAllAsTouched();
      this.alertService.showWarning('Sede inválida', 'Debes seleccionar una sede responsable para publicar.');
      return;
    }

    if (!this.isListValid()) {
      // Re-validamos nombres duplicados para el mensaje específico
      const names = this.selectedProducts.map(p => p.name.trim().toLowerCase());
      const hasDuplicates = names.length !== new Set(names).size;

      if (hasDuplicates) {
        this.alertService.showWarning('Productos Duplicados', 'No puedes tener dos productos con el mismo nombre en la misma solicitud.');
      } else {
        this.alertService.showWarning(
          'Productos inválidos',
          'Asegúrate de tener al menos un producto y que todos tengan nombre, cantidad y unidad.',
        );
      }
      return;
    }

    /* Duplicate name check removed at user request */


    this.alertService
      .confirmAction('¿Publicar?', 'Se enviará a los proveedores.', 'Publicar', 'Cancelar')
      .then((confirmed) => {
        if (confirmed) this.processSave('PENDING', 'Publicada exitosamente');
      });
  }

  public isListValid(): boolean {
    if (!this.selectedProducts || this.selectedProducts.length === 0) return false;

    // 1. Validar campos obligatorios
    const allFieldsFilled = this.selectedProducts.every(
      (p) => p.name?.trim() && p.quantity > 0 && p.unitOfMeasurement?.trim(),
    );
    if (!allFieldsFilled) return false;

    // 2. Validar nombres únicos (intra-solicitud, case-insensitive)
    const names = this.selectedProducts.map(p => p.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    return names.length === uniqueNames.size;
  }



  private processSave(status: QuotationStatus, successMsg: string): void {
    this.isSaving = true;
    // getRawValue incluye campos deshabilitados si fuera necesario
    const formValues = this.quotationForm.getRawValue();

    const quotationData: Partial<QuotationRequest> = {
      ...formValues,
      status: status,
    };



    // 1. Guardamos o actualizamos la solicitud (padre)
    const request$ =
      this.isEditMode && this.quotationId
        ? this.quotationService.update(this.quotationId, quotationData)
        : this.quotationService.save(quotationData);

    request$
      .pipe(
        switchMap((savedQuotation: QuotationRequest) => {
          const qId = this.quotationId || savedQuotation?.id;
          if (!qId) {
            console.error('No se obtuvo un ID de la solicitud guardada', savedQuotation);
            throw new Error('ID no encontrado tras guardar la solicitud');
          }

          // 2. Preparamos las operaciones de los productos
          // FILTRO: Solo procesamos productos que tengan nombre (evitamos enviar filas vacías)
          const validProducts = this.selectedProducts.filter((item) => item.name?.trim());

          if (validProducts.length === 0) {
            console.log('No hay productos válidos para guardar');
            return of(savedQuotation);
          }

          const productOperations = validProducts.map((item) => {
            const productBody: any = {
              name: item.name,
              description: item.description,
              amount: item.quantity,
              unitOfMeasurement: item.unitOfMeasurement || 'Unidad',
              quotationRequestId: qId,
            };

            if (String(item.id).startsWith('temp-')) {
              return this.productService.save(productBody);
            } else {
              // OPTIMIZACIÓN: Solo actualizar si realmente cambió este producto específico
              // Buscamos el estado inicial en el hash (si existe)
              const isChanged = this.checkIfProductChanged(item);
              if (isChanged) {
                return this.productService.update(item.id!, productBody);
              } else {
                return of(null);
              }
            }
          });

          return forkJoin(productOperations).pipe(
            map(() => savedQuotation),
            catchError((err) => {
              console.error('Error en operaciones de productos:', err);
              throw err;
            }),
          );
        }),
        catchError((err) => {
          console.error('Error general en processSave:', err);
          this.isSaving = false;
          throw err;
        }),
      )
      .subscribe({
        next: (res) => {
          this.handleSuccess(successMsg);
        },
        error: (err) => {
          console.error('Error en la subscripción de processSave:', err);
          this.handleError(err);
        },
      });
  }

  delete(): void {
    if (!this.quotationId) return;
    this.alertService
      .confirmAction('¿Eliminar?', 'Esta acción es irreversible.', 'Eliminar', 'Cancelar')
      .then((confirmed) => {
        if (confirmed) {
          this.quotationService.delete(this.quotationId!).subscribe(() => {
            this.alertService.showSuccess('Eliminado', 'Solicitud eliminada con éxito');
            this.performRedirect();
          });
        }
      });
  }

  private handleSuccess(msg: string): void {
    this.isSaving = false;
    this.alertService.showSuccess('¡Hecho!', msg);
    this.performRedirect();
  }

  private performRedirect(): void {
    if (this.navigationOrigin === 'dashboard') {
      this.router.navigate(['/dashboard/quotations']);
    } else {
      const target =
        this.currentStatus === 'PENDING'
          ? 'published'
          : 'drafts';
      this.router.navigate([`/dashboard/quotations/${target}`]);
    }
  }

  private handleError(err: any): void {
    this.isSaving = false;
    const errorMessage = err.error?.errors?.[0]?.msg || err.error?.message || 'Error inesperado';
    this.alertService.showError('Error', errorMessage);
  }

  private checkIfProductChanged(item: QuotationItem): boolean {
    if (!this.initialFormHash) return true;
    const initial = JSON.parse(this.initialFormHash);
    const initialProducts = initial.products as any[];
    
    // Como queremos mantener el orden, usamos el refIndex o el nombre si es único
    const original = initialProducts.find((p, idx) => p.id === item.id || (idx + 1 === item.refIndex));
    if (!original) return true;

    return (
      item.name?.trim().toLowerCase() !== original.name ||
      item.quantity !== original.quantity ||
      (item.unitOfMeasurement?.trim().toLowerCase() || '') !== original.unit ||
      (item.description?.trim().toLowerCase() || '') !== original.description
    );
  }

  goBack(): void {
    this.performRedirect();
  }
}
