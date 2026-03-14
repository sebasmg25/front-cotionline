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
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';

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
    RouterModule,
  ],
  templateUrl: './dashboard-quotation.html',
  styleUrl: './dashboard-quotation.css',
})
export class DashboardQuotation implements OnInit {
  latestPublished$: Observable<QuotationRequest[]>;
  drafts$: Observable<QuotationRequest[]>;

  constructor(
    private quotationRequestService: QuotationRequestService,
    private router: Router,
  ) {
    const history$ = this.quotationRequestService.getMyHistory().pipe(shareReplay(1));

    this.latestPublished$ = history$.pipe(
      map((items) =>
        items
          .filter(
            (i) => i.status === 'PENDING' || i.status === 'QUOTED',
          )
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, 5),
      ),
    );

    this.drafts$ = history$.pipe(map((items) => items.filter((i) => i.status === 'DRAFT')));
  }

  ngOnInit(): void {}

  viewDetail(item: QuotationRequest): void {
    if (!item.id) return;

    // Usamos rutas absolutas para evitar que el router se pierda
    if (item.status === 'DRAFT') {
      this.router.navigate(['/dashboard/quotations/edit', item.id], {
        queryParams: { origin: 'dashboard' },
      });
    } else {
      this.router.navigate(['/dashboard/quotations/detail', item.id], {
        queryParams: { origin: 'dashboard' },
      });
    }
  }

  createNew(): void {
    this.router.navigate(['/dashboard/quotations/new']);
  }

  viewAllPublished(): void {
    // Apuntamos a la ruta de historial que ya tienes (list-quotation-requests)
    this.router.navigate(['/dashboard/quotations/published']);
  }

  viewAllDrafts(): void {
    // Si no tienes una vista de lista de borradores separada,
    // podrías usar la misma de 'published' pero pasando el queryParam DRAFT
    this.router.navigate(['/dashboard/quotations/drafts']);
  }
}
