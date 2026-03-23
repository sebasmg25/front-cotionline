import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { startWith, map, take, catchError } from 'rxjs/operators';

import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Branch } from '../../domain/models/branch.model';
import { DEPARTMENTS, COLOMBIAN_DATA } from '../../../shared/data/cities.data';

@Component({
  selector: 'app-register-branch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
  ],
  templateUrl: './register-branch.html',
  styleUrl: './register-branch.css',
})
export class RegisterBranch implements OnInit {
  branchForm: FormGroup;
  businessId: string = '';

  departments: string[] = DEPARTMENTS;
  filteredDepartments$!: Observable<string[]>;
  filteredCities$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private businessService: BusinessService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.branchForm = this.fb.group({
      businessName: [{ value: 'Cargando...', disabled: true }],
      name: ['', [Validators.required, Validators.minLength(3)]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      address: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.setupGeographyFilters();
    this.loadInitialData();
  }

  private setupGeographyFilters(): void {
    this.filteredDepartments$ = this.branchForm.get('department')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '', this.departments)),
    );
    this.branchForm.get('department')!.valueChanges.subscribe((dept) => {
      this.updateCityState(dept);
    });
  }

  private updateCityState(dept: string): void {
    const cityControl = this.branchForm.get('city')!;
    if (this.departments.includes(dept)) {
      cityControl.enable();
      const availableCities = COLOMBIAN_DATA[dept] || [];
      this.filteredCities$ = cityControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filter(value || '', availableCities)),
      );
    } else {
      cityControl.disable();
      cityControl.setValue('');
    }
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(filterValue));
  }

  private loadInitialData(): void {
    this.businessService
      .findByUser()
      .pipe(take(1))
      .subscribe({
        next: (business) => {
          if (business && business.id) {
            this.businessId = business.id;
            this.branchForm.patchValue({ businessName: business.name });

            this.userService
              .getProfile()
              .pipe(
                take(1),
                catchError(() => of(null)),
              )
              .subscribe((user) => {
                if (user) {
                  this.branchForm.patchValue({
                    department: user.department || '',
                    city: user.city || '',
                  });
                  if (user.department) {
                    this.updateCityState(user.department);
                  }
                }
              });
          }
        },
        error: (err) => {
          console.error('Error loading business:', err);
          this.alertService.showError('Error', err.error?.message || 'No se pudo cargar la información de tu negocio.');
        },
      });
  }

  registerBranch(): void {
    if (this.branchForm.invalid || !this.businessId) {
      this.branchForm.markAllAsTouched();
      return;
    }

    const { name, address, city, department } = this.branchForm.getRawValue();

    const newBranch = new Branch(name, address, city, this.businessId);

    this.branchService.save(newBranch).subscribe({
      next: () => {
        this.alertService.showSuccess('Sede Registrada', 'La sede ha sido creada exitosamente.');
        this.router.navigate(['/dashboard/branches']);
      },
      error: (err) => {
        const msg = err.error?.message || 'No se pudo registrar la sede.';
        this.alertService.showError('Error de Registro', msg);
      },
    });
  }

  resetForm(): void {
    const currentBizName = this.branchForm.get('businessName')?.value;
    this.branchForm.reset();
    this.branchForm.patchValue({ businessName: currentBizName });
    this.branchForm.get('city')?.disable();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/branches']);
  }
}
