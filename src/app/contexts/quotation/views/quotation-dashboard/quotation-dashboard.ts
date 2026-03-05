import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { Quotation } from '../../domain/models/quotation.model';
import { QuotationRequest } from '../../../quotationRequest/domain/models/quotation-request.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-quotation-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule,
        MatTabsModule,
        RouterModule
    ],
    templateUrl: './quotation-dashboard.html',
    styleUrl: './quotation-dashboard.css'
})
export class QuotationDashboard implements OnInit {
    sentQuotations$: Observable<Quotation[]>;
    receivedQuotations$: Observable<Quotation[]>;
    incomingRequests$: Observable<QuotationRequest[]>;
    draftQuotations$: Observable<Quotation[]>;

    constructor(
        private quotationService: QuotationService,
        private router: Router
    ) {
        this.sentQuotations$ = this.quotationService.getSentQuotations();
        this.receivedQuotations$ = this.quotationService.getReceivedQuotations();
        this.incomingRequests$ = this.quotationService.getIncomingRequests();
        this.draftQuotations$ = this.quotationService.getDraftQuotations();
    }

    ngOnInit(): void { }

    respondRequest(requestId: string): void {
        this.router.navigate(['/dashboard/quotation-management/respond', requestId]);
    }

    editDraft(quotationId: string): void {
        this.router.navigate(['/dashboard/quotation-management/edit', quotationId]);
    }

    viewQuotation(id: string): void {
        // Future detail view
    }

    goBack(): void {
        this.router.navigate(['/dashboard']);
    }
}
