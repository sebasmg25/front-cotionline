import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { QuotationRequest } from '../../../quotationRequest/domain/models/quotation-request.model';

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
        RouterModule
    ],
    templateUrl: './quotation-response.html',
    styleUrl: './quotation-response.css'
})
export class QuotationResponse implements OnInit {
    responseForm: FormGroup;
    requestId: string | null = null;
    quotationId: string | null = null;
    request?: QuotationRequest;
    isSaving: boolean = false;
    isEditMode: boolean = false;
    totalAmount: number = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private quotationService: QuotationService,
        private requestService: QuotationRequestService,
        private alertService: AlertService
    ) {
        this.responseForm = this.fb.group({
            emissionDate: [{ value: new Date(), disabled: true }, [Validators.required]],
            expirationDate: [null, [Validators.required]],
            deliveryTime: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            individualValues: this.fb.array([])
        });
    }

    get individualValues(): FormArray {
        return this.responseForm.get('individualValues') as FormArray;
    }

    ngOnInit(): void {
        this.requestId = this.route.snapshot.paramMap.get('requestId');
        this.quotationId = this.route.snapshot.paramMap.get('quotationId');

        if (this.quotationId) {
            this.isEditMode = true;
            this.loadQuotationDraft(this.quotationId);
        } else if (this.requestId) {
            this.loadRequest(this.requestId);
        }

        this.responseForm.get('individualValues')?.valueChanges.subscribe(() => {
            this.calculateTotal();
        });
    }

    loadQuotationDraft(id: string): void {
        this.quotationService.getQuotationById(id).subscribe(q => {
            if (q) {
                this.requestId = q.requestId;
                this.loadRequest(q.requestId);
                this.responseForm.patchValue({
                    emissionDate: q.emissionDate,
                    expirationDate: q.expirationDate,
                    deliveryTime: q.deliveryTime,
                    description: q.description
                });
                // Note: individual values will be patched once request items are loaded in loadRequest
                // But we need to ensure the values from the draft are used.
                // We'll handle this in a specialized way.
                this.draftValues = q.individualValues;
            }
        });
    }

    private draftValues: any[] = [];

    loadRequest(id: string): void {
        this.requestService.findById(id).subscribe(r => {
            if (r) {
                this.request = r;
                this.initIndividualValues(r.items);
                if (this.isEditMode && this.draftValues.length > 0) {
                    this.patchDraftValues();
                }
            }
        });
    }

    patchDraftValues(): void {
        const controls = this.individualValues.controls;
        this.draftValues.forEach(dv => {
            const control = controls.find(c => c.get('productId')?.value === dv.productId);
            if (control) {
                control.patchValue({ individualValue: dv.individualValue });
            }
        });
        this.calculateTotal();
    }

    initIndividualValues(items: any[]): void {
        const itemFormGroups = items.map(item => this.fb.group({
            productId: [item.id],
            productName: [item.name],
            quantity: [item.quantity],
            individualValue: [0, [Validators.required, Validators.min(0)]]
        }));
        this.responseForm.setControl('individualValues', this.fb.array(itemFormGroups));
    }

    calculateTotal(): void {
        this.totalAmount = this.individualValues.controls.reduce((acc, control) => {
            const val = control.get('individualValue')?.value || 0;
            const qty = control.get('quantity')?.value || 0;
            return acc + (val * qty);
        }, 0);
    }

    sendQuotation(): void {
        this.processSave('sent', 'Tu cotización ha sido enviada exitosamente.');
    }

    saveAsDraft(): void {
        this.processSave('draft', 'Borrador de respuesta guardado.');
    }

    processSave(status: 'sent' | 'draft', successMsg: string): void {
        if (this.responseForm.invalid || !this.request) return;

        const confirmMsg = status === 'sent'
            ? '¿Enviar esta cotización? No podrás editarla después.'
            : '¿Guardar cambios como borrador?';

        this.alertService.confirmAction(
            status === 'sent' ? 'Enviar Cotización' : 'Guardar Cotización',
            confirmMsg,
            status === 'sent' ? 'ACEPTAR Y ENVIAR' : 'GUARDAR CAMBIOS',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.isSaving = true;
                const formValue = this.responseForm.getRawValue();
                const data = {
                    ...formValue,
                    id: this.quotationId || undefined,
                    requestId: this.request?.id,
                    requestTitle: this.request?.title,
                    totalValue: this.totalAmount,
                    status: status,
                    fromBusinessId: 'current-biz',
                    toBusinessId: 'requester-biz'
                };

                this.quotationService.saveResponse(data).subscribe(() => {
                    this.alertService.showSuccess(status === 'sent' ? 'Enviada' : 'Guardada', successMsg);
                    this.router.navigate(['/dashboard/quotation-management']);
                });
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/dashboard/quotation-management']);
    }
}
