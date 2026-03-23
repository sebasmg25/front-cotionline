import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { QuotationRequest } from '../../domain/models/quotation-request.model';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute } from '@angular/router';

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
    MatTooltipModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './list-quotation-requests.html',
  styleUrl: './list-quotation-requests.css',
})
export class ListQuotationRequests implements OnInit {
  published$: Observable<QuotationRequest[]>;
  drafts$: Observable<QuotationRequest[]>;

  // Control de flujo de datos
  private refreshData$ = new BehaviorSubject<void>(undefined);
  searchQueryPublished = new BehaviorSubject<string>('');
  searchQueryDrafts = new BehaviorSubject<string>('');

  selectedTabIndex = 0;
  displayedColumns: string[] = ['title', 'date', 'status', 'actions'];

  constructor(
    private quotationService: QuotationRequestService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const dataStream$ = this.refreshData$.pipe(
      switchMap(() => this.quotationService.getMyHistory()),
    );
    this.published$ = combineLatest([
      dataStream$,
      this.searchQueryPublished.pipe(startWith('')),
    ]).pipe(
      map(([list, search]) =>
        list.filter(
          (item) =>
            item.status !== 'DRAFT' &&
            item.title.toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    );

    this.drafts$ = combineLatest([dataStream$, this.searchQueryDrafts.pipe(startWith(''))]).pipe(
      map(([list, search]) =>
        list.filter(
          (item) =>
            item.status === 'DRAFT' && item.title.toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    );
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      const status = params['status'];
      if (status === 'DRAFT') {
        this.selectedTabIndex = 1;
      } else {
        this.selectedTabIndex = 0;
      }
    });

    const url = this.router.url;
    if (url.includes('drafts')) {
      this.selectedTabIndex = 1;
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    const targetRoute = index === 1 ? 'drafts' : 'published';
    this.router.navigate([`/dashboard/quotations/${targetRoute}`], { queryUrl: true } as any);
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
    if (this.selectedTabIndex === 1) {
      this.router.navigate(['/dashboard/quotations/edit', id], {
        queryParams: { origin: 'list' },
      });
    } else {
      this.router.navigate(['/dashboard/quotations/detail', id], {
        queryParams: { origin: 'list' },
      });
    }
  }

  duplicateRequest(id: string): void {
    this.alertService
      .confirmAction(
        '¿Duplicar Solicitud?',
        'Se creará una copia en estado borrador.',
        'Duplicar',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.quotationService.duplicate(id).subscribe({
            next: () => {
              this.alertService.showSuccess('Copiado', 'Solicitud duplicada exitosamente');
              this.loadData();
            },
            error: (err) => {
              const msg = err.error?.message || 'No se pudo duplicar';
              this.alertService.showError('Error', msg);
            },
          });
        }
      });
  }

  deleteRequest(id: string): void {
    this.alertService
      .confirmAction(
        '¿Eliminar Solicitud?',
        'Esta acción no se puede deshacer.',
        'Eliminar',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.quotationService.delete(id).subscribe({
            next: () => {
              this.alertService.showSuccess('Eliminado', 'La solicitud ha sido eliminada');
              this.loadData();
            },
            error: (err) => {
              const msg = err.error?.message || 'No se pudo eliminar';
              this.alertService.showError('Error', msg);
            },
          });
        }
      });
  }

  loadData(): void {
    this.refreshData$.next();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/quotations']);
  }
}
