import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { QuotationRequest } from '../../domain/models/quotation-request.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard-quotation',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatDividerModule,
        RouterModule
    ],
    templateUrl: './dashboard-quotation.html',
    styleUrl: './dashboard-quotation.css'
})
export class DashboardQuotation implements OnInit {
    latestPublished$: Observable<QuotationRequest[]>;
    drafts$: Observable<QuotationRequest[]>;

    constructor(
        private quotationService: QuotationRequestService,
        private router: Router
    ) {
        this.latestPublished$ = this.quotationService.findLatestPublished(5);
        this.drafts$ = this.quotationService.findDrafts();
    }

    ngOnInit(): void { }

    viewDetail(id: string): void {
        this.router.navigate(['/dashboard/quotations/detail', id]);
    }

    createNew(): void {
        this.router.navigate(['/dashboard/quotations/new']);
    }

    viewAllPublished(): void {
        this.router.navigate(['/dashboard/quotations/published']);
    }

    viewAllDrafts(): void {
        this.router.navigate(['/dashboard/quotations/drafts']);
    }
}
