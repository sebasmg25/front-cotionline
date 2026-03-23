import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { QuotationRequest } from '../../../quotationRequest/domain/models/quotation-request.model';
import { Quotation } from '../../../quotation/domain/models/quotation.model';

@Component({
  selector: 'app-quotation-response',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    RouterModule,
    MatDividerModule,
  ],
  templateUrl: './quotation-response.html',
  styleUrl: './quotation-response.css',
})
export class QuotationResponse implements OnInit {
  responseForm: FormGroup;
  requestId: string | null = null;
  quotationId: string | null = null;
  request?: QuotationRequest;
  isSaving: boolean = false;
  isEditMode: boolean = false;
  isViewMode: boolean = false;
  totalPrice: number = 0;
  minDate: Date;
  private draftValues: any[] = [];
  initialValues: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationService,
    private requestService: QuotationRequestService,
    private alertService: AlertService,
  ) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow;

    this.responseForm = this.fb.group({
      emissionDate: [{ value: new Date(), disabled: true }, [Validators.required]],
      expirationDate: [null, [Validators.required]],
      deliveryTime: [null, [Validators.required]],
      description: [''],
      individualValues: this.fb.array([]),
    });
  }
  get individualValues(): FormArray {
    return this.responseForm.get('individualValues') as FormArray;
  }

  get hasChanges(): boolean {
    if (!this.initialValues) return false;
    const current = this.responseForm.getRawValue();
    
    const basicChanged = 
      current.expirationDate?.toString() !== this.initialValues.expirationDate?.toString() ||
      current.deliveryTime?.toString() !== this.initialValues.deliveryTime?.toString() ||
      current.description !== this.initialValues.description;

    if (basicChanged) return true;

    const currentIndividual = current.individualValues || [];
    const initialIndividual = this.initialValues.individualValues || [];

    if (currentIndividual.length !== initialIndividual.length) return true;

    for (let i = 0; i < currentIndividual.length; i++) {
        if (currentIndividual[i].individualValue !== initialIndividual[i].individualValue) {
            return true;
        }
    }

    return false;
  }

  ngOnInit(): void {
    this.requestId = this.route.snapshot.paramMap.get('requestId');
    this.quotationId = this.route.snapshot.paramMap.get('quotationId');

    if (this.quotationId) {
      this.isViewMode = this.router.url.includes('/detail/');
      this.isEditMode = !this.isViewMode;
      this.loadExistingQuotation(this.quotationId);
    } else if (this.requestId) {
      this.loadRequest(this.requestId);
    }

    this.responseForm.valueChanges.subscribe(() => {
      this.calculateTotal();
      if (this.responseForm.invalid) {
        const controls = this.responseForm.controls;
        const individualValues = this.responseForm.get('individualValues') as FormArray;
        individualValues.controls.forEach((group, index) => {
        });
      }
    });
  }

  loadExistingQuotation(id: string): void {
    this.quotationService.getQuotationById(id).subscribe({
      next: (q: Quotation | undefined) => {
        if (q) {
          this.requestId = q.quotationRequestId;
          this.loadRequest(q.quotationRequestId);
          this.responseForm.patchValue({
            emissionDate: q.issueDate,
            expirationDate: q.responseDeadline,
            deliveryTime: q.deliveryTime,
            description: q.description,
          });
          this.draftValues = (q as any).individualValues || [];

          if (this.isViewMode) {
            this.responseForm.disable();
          }
        }
      },
      error: (err) => this.alertService.showError('Error', err.error?.message || 'No se pudo cargar la cotización.'),
    });
  }

  loadRequest(id: string): void {
    this.requestService.findById(id).subscribe({
      next: (r: QuotationRequest) => {
        if (r) {
          this.handleRequestSuccess(r);
        }
      },
      error: (err) => {
        if (err.status === 404 || err.status === 403) {
          this.requestService.findPublicById(id).subscribe({
            next: (r: QuotationRequest) => this.handleRequestSuccess(r),
            error: (publicErr) => this.handleRequestError(publicErr),
          });
        } else {
          this.handleRequestError(err);
        }
      },
    });
  }

  private handleRequestSuccess(r: QuotationRequest): void {
    this.request = r;
    this.initIndividualValues(r.items || []);
    if ((this.isEditMode || this.isViewMode) && this.draftValues.length > 0) {
      this.patchDraftValues();
    }
    
    if (this.isEditMode) {
      setTimeout(() => {
        this.initialValues = this.responseForm.getRawValue();
      }, 500);
    }
  }

  private handleRequestError(err: any): void {
    console.error('QuotationResponse: Error al cargar solicitud:', err);
    this.alertService.showError('Error', err.error?.message || 'No se pudo cargar la solicitud de cotización.');
  }

  initIndividualValues(items: any[]): void {
    const itemFormGroups = items.map((item) =>
      this.fb.group({
        productId: [item.id],
        productName: [item.name],
        quantity: [item.quantity || 1],
        individualValue: [0, [Validators.required, Validators.min(1)]],
      }),
    );
    this.responseForm.setControl('individualValues', this.fb.array(itemFormGroups));
    
    if (this.isViewMode) {
      this.individualValues.disable();
    }

    this.calculateTotal();
  }

  patchDraftValues(): void {
    const controls = this.individualValues.controls;
    this.draftValues.forEach((dv) => {
      const control = controls.find((c) => c.get('productId')?.value === dv.productId);
      if (control) {
        control.patchValue({ individualValue: dv.individualValue }, { emitEvent: false });
      }
    });
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalPrice = this.individualValues.controls.reduce((acc, control) => {
      const val = control.get('individualValue')?.value || 0;
      const qty = control.get('quantity')?.value || 0;
      return acc + val * qty;
    }, 0);
  }

  sendQuotation(): void {
    this.processSave('PENDING', 'Tu cotización ha sido enviada exitosamente.');
  }

  saveAsDraft(): void {
    this.processSave('DRAFT', 'Borrador de respuesta guardado.');
  }

  processSave(status: 'PENDING' | 'DRAFT', successMsg: string): void {
    const isDraft = status === 'DRAFT';

    const expirationValid = this.responseForm.get('expirationDate')?.valid;
    const deliveryValid = this.responseForm.get('deliveryTime')?.valid;

    if (!expirationValid || !deliveryValid || !this.request) {
      this.alertService.showError('Fechas Incompletas', 'Debes completar la Fecha de Expiración y la Fecha de Entrega.');
      this.responseForm.get('expirationDate')?.markAsTouched();
      this.responseForm.get('deliveryTime')?.markAsTouched();
      return;
    }

    if (!isDraft) {
      if (this.responseForm.invalid) {
        this.alertService.showError('Precios Inválidos', 'Para enviar la cotización debes ingresar precios mayores a $0 en los productos.');
        this.responseForm.markAllAsTouched();
        return;
      }
      
      const prices = this.individualValues.value.map((v: any) => v.individualValue || 0);
      const hasAtLeastOnePrice = prices.some((p: number) => p > 0);
      
      if (!hasAtLeastOnePrice) {
        this.alertService.showError('Sin Precios', 'Debes ingresar el valor de al menos un producto para enviar.');
        return;
      }
    }

    const actionText = status === 'PENDING' ? 'Enviar Cotización' : 'Guardar Borrador';
    const confirmMsg =
      status === 'PENDING'
        ? '¿Enviar esta cotización? No podrás editarla después.'
        : '¿Guardar cambios como borrador?';

    this.alertService
      .confirmAction(
        actionText,
        confirmMsg,
        status === 'PENDING' ? 'ACEPTAR Y ENVIAR' : 'GUARDAR',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.isSaving = true;
          const formValue = this.responseForm.getRawValue();

          const safeIndividualValues = formValue.individualValues.map((iv: any) => ({
            ...iv,
            individualValue: Number(iv.individualValue) || 0,
          }));
          const data: Partial<Quotation> = {
            id: this.quotationId || undefined,
            quotationRequestId: this.request?.id || '',
            responseDeadline: formValue.expirationDate,
            deliveryTime: formValue.deliveryTime,
            description: formValue.description,
            price: this.totalPrice,
            status: status as any,
            individualValues: safeIndividualValues,
          };

          this.quotationService.saveResponse(data).subscribe({
            next: () => {
              this.alertService.showSuccess('Éxito', successMsg);
              this.goBack();
            },
            error: (err) => {
              this.isSaving = false;
              const errorMsg = err.error?.message || 'Ocurrió un error al procesar la cotización.';
              this.alertService.showError('Error', errorMsg);
            },
          });
        }
      });
  }

  goBack(): void {
    window.history.back();
  }
}
