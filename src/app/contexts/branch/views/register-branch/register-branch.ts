import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Branch } from '../../domain/models/branch.model';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';

@Component({
  selector: 'app-register-branch',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './register-branch.html',
  styleUrl: './register-branch.css',
})
export class RegisterBranch implements OnInit {
  businessId: string | null = null;
  businessName: string = 'Cargando...';

  constructor(
    private branchService: BranchService,
    private businessService: BusinessService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('businessId');
    if (this.businessId) {
      this.businessService.findById(this.businessId).subscribe({
        next: (business) => {
          this.businessName = business.name;
        },
        error: () => {
          this.businessName = 'Negocio no encontrado';
        }
      });
    }
  }

  name: string = '';
  city: string = '';
  address: string = '';

  resetForm(): void {
    this.name = '';
    this.city = '';
    this.address = '';
  }

  validateFields() {
    if (!this.name || !this.city || !this.address) {
      console.log('Debe llenar todos los campos');
      return;
    }
  }

  registerBranch() {
    console.log('ENTRO SEDE');
    this.validateFields();

    if (!this.businessId) {
      console.log('No se puede registrar la sede, falta el id del negocio');
      return;
    }

    const branch: Branch = {
      name: this.name,
      address: this.address,
      city: this.city,
      businessId: this.businessId,
    };

    this.branchService.save(branch).subscribe({
      next: (result) => {
        console.log('RESULTADO SEDEEEE', result);
      },
      error(err) {
        if (err) {
          console.log('Error', err.error);
        } else {
          console.log('Error del servidor', err);
        }
      },
      complete() {
        console.log('Fin');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/branches']);
  }
}
