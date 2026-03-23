import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Branch } from '../../domain/models/branch.model';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { AlertService } from '../../../shared/services/alert.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-list-branches',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './list-branches.html',
  styleUrl: './list-branches.css',
})
export class ListBranches implements OnInit {
  branches: Branch[] = [];
  displayedColumns: string[] = ['name', 'address', 'location', 'actions'];
  isLoading: boolean = true;
  businessName: string = '';

  constructor(
    private router: Router,
    private branchService: BranchService,
    private businessService: BusinessService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.businessService.findByUser().subscribe({
      next: (business) => {
        if (business && business.id) {
          this.businessName = business.name;
          this.branchService.findAllByBusiness(business.id).subscribe({
            next: (data) => {
              this.branches = data;
              this.isLoading = false;
            },
            error: (err) => {
              this.alertService.showError('Error', err.error?.message || 'No se pudieron cargar las sedes.');
              this.isLoading = false;
            },
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.alertService.showError('Error', err.error?.message || 'Error al obtener la información del negocio.');
      },
    });
  }

  async deleteBranch(id: string | undefined): Promise<void> {
    if (!id) return;

    const confirmed = await this.alertService.confirmAction(
      '¿Eliminar sede?',
      'Esta acción no se puede deshacer y podría afectar documentos vinculados.',
      'Sí, eliminar',
      'Cancelar',
    );

    if (confirmed) {
      this.branchService.delete(id).subscribe({
        next: () => {
          this.alertService.showSuccess('Eliminado', 'La sede ha sido removida correctamente.');
          this.loadBranches();
        },
        error: (err) => {
          const msg = err.error?.message || 'Error al eliminar la sede.';
          this.alertService.showError('Error', msg);
        },
      });
    }
  }

  editBranch(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard/branch-edit', id]).catch((err) => {
        console.error('Error al navegar a edición:', err);
        this.alertService.showError('Error', 'No se pudo encontrar la ruta de edición.');
      });
    }
  }

  createBranch(): void {
    this.router.navigate(['/dashboard/branch-register']).catch((err) => {
      console.error('Error al navegar a registro:', err);
      this.alertService.showError('Error de Navegación', 'La ruta de registro no existe.');
    });
  }
}
