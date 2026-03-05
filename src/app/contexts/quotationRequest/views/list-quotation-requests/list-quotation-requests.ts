import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { QuotationRequest } from '../../domain/models/quotation-request.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from '../../../shared/services/alert.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-list-quotation-requests',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        RouterModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule
    ],
    templateUrl: './list-quotation-requests.html',
    styleUrl: './list-quotation-requests.css'
})
export class ListQuotationRequests implements OnInit {
    published$: Observable<QuotationRequest[]>;
    drafts$: Observable<QuotationRequest[]>;

    // Search filters
    searchQueryPublished = new BehaviorSubject<string>('');
    searchQueryDrafts = new BehaviorSubject<string>('');

    selectedTabIndex = 0;
    displayedColumns: string[] = ['title', 'date', 'actions'];

    constructor(
        private quotationService: QuotationRequestService,
        private alertService: AlertService,
        private router: Router
    ) {
        // Published filtering logic
        this.published$ = combineLatest([
            this.quotationService.findLatestPublished(100),
            this.searchQueryPublished.pipe(startWith(''))
        ]).pipe(
            map(([list, search]) => list.filter(item =>
                item.title.toLowerCase().includes(search.toLowerCase())
            ))
        );

        // Drafts filtering logic
        this.drafts$ = combineLatest([
            this.quotationService.findDrafts(),
            this.searchQueryDrafts.pipe(startWith(''))
        ]).pipe(
            map(([list, search]) => list.filter(item =>
                item.title.toLowerCase().includes(search.toLowerCase())
            ))
        );
    }

    ngOnInit(): void {
        // Sync tab with route
        const url = this.router.url;
        if (url.includes('drafts')) {
            this.selectedTabIndex = 1;
        } else {
            this.selectedTabIndex = 0;
        }
    }

    onTabChange(index: number): void {
        this.selectedTabIndex = index;
        if (index === 1) {
            this.router.navigate(['/dashboard/quotations/drafts'], { replaceUrl: true });
        } else {
            this.router.navigate(['/dashboard/quotations/published'], { replaceUrl: true });
        }
    }

    onSearchPublished(event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        this.searchQueryPublished.next(query);
    }

    onSearchDrafts(event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        this.searchQueryDrafts.next(query);
    }

    viewDetail(id: string): void {
        this.router.navigate(['/dashboard/quotations/detail', id]);
    }

    duplicateRequest(id: string): void {
        this.alertService.confirmAction(
            '¿Duplicar Solicitud?',
            'Se creará una copia en estado borrador.',
            'Duplicar',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.quotationService.duplicate(id).subscribe(() => {
                    this.alertService.showSuccess('Copiado', 'Solicitud duplicada exitosamente');
                    this.loadData();
                });
            }
        });
    }

    deleteRequest(id: string): void {
        this.alertService.confirmAction(
            '¿Eliminar Solicitud?',
            'Esta acción no se puede deshacer.',
            'Eliminar',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.quotationService.delete(id).subscribe(() => {
                    this.alertService.showSuccess('Eliminado', 'La solicitud ha sido eliminada');
                    this.loadData();
                });
            }
        });
    }

    private loadData(): void {
        // Simple manual refresh of the observables
        this.published$ = combineLatest([
            this.quotationService.findLatestPublished(100),
            this.searchQueryPublished.pipe(startWith(''))
        ]).pipe(
            map(([list, search]) => list.filter(item =>
                item.title.toLowerCase().includes(search.toLowerCase())
            ))
        );

        this.drafts$ = combineLatest([
            this.quotationService.findDrafts(),
            this.searchQueryDrafts.pipe(startWith(''))
        ]).pipe(
            map(([list, search]) => list.filter(item =>
                item.title.toLowerCase().includes(search.toLowerCase())
            ))
        );
    }

    goBack(): void {
        this.router.navigate(['/dashboard/quotations']);
    }
}
