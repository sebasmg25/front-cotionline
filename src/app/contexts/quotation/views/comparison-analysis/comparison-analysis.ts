import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { Quotation } from '../../domain/models/quotation.model';
import { QuotationRequest } from '../../../quotationRequest/domain/models/quotation-request.model';
import { Observable } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-comparison-analysis',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatTableModule,
        MatDividerModule,
        MatListModule,
        RouterModule,
        MatButtonToggleModule,
        MatTooltipModule
    ],
    templateUrl: './comparison-analysis.html',
    styleUrl: './comparison-analysis.css'
})
export class ComparisonAnalysis implements OnInit {
    // Step 1: Requests list
    requests$: Observable<QuotationRequest[]>;
    selectedRequest: QuotationRequest | null = null;

    // Step 2: Proposals for selection
    proposals$: Observable<Quotation[]> | null = null;
    selection = new SelectionModel<Quotation>(true, []);
    displayedColumns: string[] = ['select', 'supplier', 'value', 'delivery', 'status'];

    // Step 3: Comparison
    comparisonCriterion: 'value' | 'delivery' = 'value';
    bestProposal: Quotation | null = null;
    isCompared: boolean = false;

    constructor(
        private quotationService: QuotationService,
        private requestService: QuotationRequestService,
        private alertService: AlertService
    ) {
        this.requests$ = this.requestService.findAll(); // Assuming this returns all requests
    }

    ngOnInit(): void { }

    selectRequest(request: QuotationRequest): void {
        this.selectedRequest = request;
        this.selection.clear();
        this.proposals$ = this.quotationService.getReceivedQuotationsByRequestId(request.id);
    }

    deselectRequest(): void {
        this.selectedRequest = null;
        this.proposals$ = null;
        this.selection.clear();
    }

    generateComparison(): void {
        if (this.selection.selected.length < 2) {
            this.alertService.showInfo('Selección requerida', 'Selecciona al menos 2 propuestas para comparar.');
            return;
        }

        const selected = this.selection.selected;
        this.isCompared = true;

        if (this.comparisonCriterion === 'value') {
            this.bestProposal = selected.reduce((prev, curr) =>
                curr.totalValue < prev.totalValue ? curr : prev
            );
        } else {
            // "Tiempo de entrega" extract number (e.g. "3 días" -> 3)
            this.bestProposal = selected.reduce((prev, curr) => {
                const daysPrev = parseInt(prev.deliveryTime) || 999;
                const daysCurr = parseInt(curr.deliveryTime) || 999;
                return daysCurr < daysPrev ? curr : prev;
            });
        }
    }

    acceptProposal(proposal: Quotation): void {
        this.alertService.confirmAction(
            '¿Aceptar esta Propuesta?',
            `Se notificará al proveedor (Biz: ${proposal.fromBusinessId}) que su propuesta de ${proposal.totalValue.toLocaleString()} fue seleccionada.`,
            'ACEPTAR PROPUESTA',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.quotationService.notifyProvider(proposal.id).subscribe(() => {
                    this.alertService.showSuccess('Propuesta Aceptada', 'Se ha enviado la notificación al proveedor. Se pondrán en contacto pronto.');
                    this.deselectRequest();
                });
            }
        });
    }

    setCriterion(criterion: 'value' | 'delivery'): void {
        this.comparisonCriterion = criterion;
        if (this.isCompared) {
            this.generateComparison();
        }
    }

    isAllSelected(proposals: Quotation[]): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = proposals.length;
        return numSelected === numRows;
    }

    toggleAll(proposals: Quotation[]): void {
        this.isAllSelected(proposals) ?
            this.selection.clear() :
            proposals.forEach(row => this.selection.select(row));
    }
}
