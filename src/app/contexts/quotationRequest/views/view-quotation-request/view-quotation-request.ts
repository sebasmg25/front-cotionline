import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { QuotationRequestService } from '../../../../infraestructure/services/quotation-request/quotation-request.service';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { QuotationRequest } from '../../domain/models/quotation-request.model';
import { QuotationRequestItemProducts } from '../quotation-request-item-products/quotation-request-item-products';

@Component({
  selector: 'app-view-quotation-request',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    QuotationRequestItemProducts,
  ],
  templateUrl: './view-quotation-request.html',
  styleUrl: './view-quotation-request.css',
})
export class ViewQuotationRequest implements OnInit {
  quotation: any = null; // Usamos any temporalmente para evitar el conflicto de tipos string vs object en la rama
  isLoading: boolean = true;
  quotationId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationRequestService,
    private branchService: BranchService,
    private businessService: BusinessService,
    private userService: UserService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.quotationId = this.route.snapshot.paramMap.get('id');
    if (this.quotationId) {
      this.loadQuotation(this.quotationId);
    } else {
      this.handleError('No se encontró el ID de la solicitud');
    }
  }

  loadQuotation(id: string): void {
    this.isLoading = true;
    this.quotationService.findById(id).subscribe({
      next: (data) => {
        if (data) {
          this.quotation = data;
          
          if (typeof this.quotation.branch === 'string') {
            if (this.quotation.branch === 'sede-principal-automatica' || this.quotation.branch === 'principal') {
              // Reconstruir nombre de sede principal dinámicamente
              forkJoin({
                business: this.businessService.findByUser(),
                user: this.userService.getProfile()
              }).subscribe({
                next: ({ business, user }) => {
                  if (business && user) {
                    const branchName = `Sede principal (${user.department}, ${user.city} - ${business.address || 'Sin dirección'})`;
                    this.quotation.branch = { name: branchName };
                  } else {
                    this.quotation.branch = { name: 'Sede Principal (Negocio)' };
                  }
                  this.isLoading = false;
                },
                error: () => {
                  this.quotation.branch = { name: 'Sede Principal (Negocio)' };
                  this.isLoading = false;
                }
              });
            } else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(this.quotation.branch)) {
              // Si no es UUID, es la cadena de la sede extraída directamente de la BD (nuevo formato)
              this.quotation.branch = { name: this.quotation.branch };
              this.isLoading = false;
            } else {
              forkJoin({
                branchData: this.branchService.findById(this.quotation.branch),
                user: this.userService.getProfile()
              }).subscribe({
                next: ({ branchData, user }) => {
                  if (branchData && user) {
                    const branchName = `${branchData.name} (${user.department}, ${branchData.city} - ${branchData.address || 'Sin dirección'})`;
                    this.quotation.branch = { ...branchData, name: branchName };
                  } else if (branchData) {
                    this.quotation.branch = branchData;
                  }
                  this.isLoading = false;
                },
                error: () => {
                  this.isLoading = false;
                }
              });
            }
          } else {
            this.isLoading = false;
          }
        } else {
          this.handleError('La solicitud no existe');
        }
      },
      error: (err) => {
        this.handleError(err.error?.message || 'Error al cargar la solicitud');
      },
    });
  }

  // Función auxiliar para el HTML
  getBranchName(): string {
    if (!this.quotation?.branch) return 'No especificada';
    return typeof this.quotation.branch === 'object'
      ? this.quotation.branch.name
      : 'ID: ' + this.quotation.branch;
  }

  deleteQuotation(): void {
    if (!this.quotationId) return;

    this.alertService
      .confirmAction(
        '¿Eliminar Publicación?',
        'Esta acción eliminará la solicitud y las cotizaciones recibidas.',
        'Eliminar',
        'Cancelar',
      )
      .then((confirmed) => {
        if (confirmed) {
          this.quotationService.delete(this.quotationId!).subscribe({
            next: () => {
              this.alertService.showSuccess('Eliminado', 'Solicitud eliminada con éxito');
              this.router.navigate(['/dashboard/quotations']);
            },
            error: () => this.alertService.showError('Error', 'No se pudo eliminar la solicitud'),
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/quotations']);
  }

  private handleError(message: string): void {
    this.isLoading = false;
    this.alertService.showError('Error', message);
    this.goBack();
  }
}
