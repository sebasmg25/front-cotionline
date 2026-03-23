import { Component, OnInit } from '@angular/core';
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
import { Observable, map } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
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
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './comparison-analysis.html',
  styleUrl: './comparison-analysis.css',
})
export class ComparisonAnalysis implements OnInit {
  requests$: Observable<QuotationRequest[]>;
  selectedRequest: QuotationRequest | null = null;

  proposals$: Observable<Quotation[]> | null = null;
  selection = new SelectionModel<Quotation>(true, []);
  displayedColumns: string[] = ['select', 'supplier', 'value', 'delivery', 'status'];

  comparisonData: any = null;
  isCompared: boolean = false;
  analysisFilter: 'price' | 'delivery' = 'price';
  winnerId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private quotationService: QuotationService,
    private requestService: QuotationRequestService,
    private alertService: AlertService,
  ) {
    this.requests$ = this.requestService
      .getMyHistory()
      .pipe(map((list) => list.filter((r) => r.status === 'PENDING' || r.status === 'QUOTED')));
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const requestId = params['requestId'];
      if (requestId) {
        this.loadRequest(requestId);
      } else {
        this.selectedRequest = null;
        this.proposals$ = null;
      }
    });
  }

  private loadRequest(requestId: string): void {
    this.requestService.getMyHistory().subscribe((requests) => {
      const found = requests.find((r) => r.id === requestId);
      if (found) {
        this.selectedRequest = found;
        this.isCompared = false;
        this.selection.clear();
        this.fetchProposals(requestId);
      }
    });
  }

  private fetchProposals(requestId: string): void {
    this.proposals$ = this.quotationService.getReceivedQuotationsByRequestId(requestId);
  }

  selectRequest(request: QuotationRequest): void {
    if (!request.id) return;
    this.router.navigate(['/dashboard/quotation-management/comparison', request.id]);
  }

  deselectRequest(): void {
    this.router.navigate(['/dashboard/quotation-management/comparison']);
  }

  generateComparison(): void {
    if (!this.selectedRequest?.id) return;
    if (this.selection.selected.length < 2) {
      this.alertService.showWarning('Selección insuficiente', 'Debes seleccionar al menos 2 cotizaciones para realizar el análisis.');
      return;
    }

    this.isCompared = true;
    this.calculateWinner();
    this.alertService.showSuccess('Análisis Generado', `Se ha identificado la mejor propuesta por ${this.analysisFilter === 'price' ? 'precio' : 'tiempo de entrega'}.`);
  }

  calculateWinner(): void {
    if (this.selection.selected.length === 0) {
      this.winnerId = null;
      return;
    }

    const selected = this.selection.selected;
    let winner = selected[0];

    for (let i = 1; i < selected.length; i++) {
      if (this.analysisFilter === 'price') {
        if (selected[i].price < winner.price) {
          winner = selected[i];
        }
      } else {
        if (selected[i].deliveryTime.getTime() < winner.deliveryTime.getTime()) {
          winner = selected[i];
        }
      }
    }

    this.winnerId = winner.id || null;
  }

  onFilterChange(): void {
    if (this.isCompared) {
      this.calculateWinner();
    }
  }

  viewDetail(proposal: Quotation): void {
    if (!proposal.id) return;
    this.router.navigate(['/dashboard/quotation-management/detail', proposal.id]);
  }

  acceptProposal(proposal: Quotation): void {
    if (!proposal.id) return;

    this.alertService
      .confirmAction(
        '¿Aceptar esta Propuesta?',
        `Se notificará al proveedor que su propuesta de ${Math.floor(proposal.price).toLocaleString()} fue seleccionada.`,
        'ACEPTAR PROPUESTA',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed && this.selectedRequest?.id) {
          this.requestService.close(this.selectedRequest.id, proposal.id as string).subscribe({
            next: () => {
              this.alertService.showSuccess(
                'Propuesta Aceptada',
                'El proveedor ha sido notificado y la solicitud ha sido cerrada exitosamente.',
              );
              this.deselectRequest();
            },
            error: (err: any) => {
              this.alertService.showError(
                'Error',
                err.error?.message || 'No se pudo completar la acción.',
              );
            },
          });
        }
      });
  }

  isAllSelected(proposals: Quotation[]): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = proposals.length;
    return numSelected === numRows;
  }

  toggleAll(proposals: Quotation[]): void {
    this.isAllSelected(proposals)
      ? this.selection.clear()
      : proposals.forEach((row) => this.selection.select(row));
  }
}
