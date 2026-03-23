import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService } from '../../../../infraestructure/services/branch/branch.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { Observable, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { DEPARTMENTS, COLOMBIAN_DATA } from '../../../shared/data/cities.data';

@Component({
  selector: 'app-edit-branch',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-branch.html',
  styleUrl: './edit-branch.css',
})
export class EditBranch implements OnInit {
  branchForm!: FormGroup;
  branchId: string | null = null;
  branchNotFound: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  initialValues: any = null;

  departments: string[] = DEPARTMENTS;
  filteredDepartments$!: Observable<string[]>;
  filteredCities$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private branchService: BranchService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupGeographyFilters();

    this.route.paramMap.subscribe((params) => {
      this.branchId = params.get('id');
      if (this.branchId) {
        this.loadBranchData(this.branchId);
      }
    });
  }

  get hasChanges(): boolean {
    if (!this.initialValues) return false;
    const current = this.branchForm.getRawValue();
    return (
      (current.name || '').trim() !== (this.initialValues.name || '').trim() ||
      (current.department || '').trim() !== (this.initialValues.department || '').trim() ||
      (current.city || '').trim() !== (this.initialValues.city || '').trim() ||
      (current.address || '').trim() !== (this.initialValues.address || '').trim()
    );
  }

  private initForm(): void {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      address: ['', [Validators.required]],
      businessId: ['', [Validators.required]],
    });
  }

  private setupGeographyFilters(): void {
    this.filteredDepartments$ = this.branchForm.get('department')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '', this.departments)),
    );

    this.branchForm.get('department')!.valueChanges.subscribe((dept) => {
      this.handleDepartmentChange(dept);
    });
  }

  private handleDepartmentChange(dept: string): void {
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

  loadBranchData(id: string): void {
    this.isLoading = true;
    this.branchService.findById(id).subscribe({
      next: (branch) => {
        const foundDept =
          this.departments.find((dept) => COLOMBIAN_DATA[dept].includes(branch.city)) || '';

        this.branchForm.patchValue({
          name: branch.name,
          department: foundDept,
          city: branch.city,
          address: branch.address,
          businessId: branch.businessId,
        });

        if (foundDept) {
          this.handleDepartmentChange(foundDept);
        }

        this.initialValues = this.branchForm.getRawValue();
        this.isLoading = false;
      },
      error: (err) => {
        this.branchNotFound = true;
        this.isLoading = false;
        this.alertService.showError('Error', err.error?.message || 'No se pudo cargar la información de la sede.');
      },
    });
  }

  onSubmit(): void {
    if (this.branchForm.valid && this.branchId) {
      const { department, city } = this.branchForm.getRawValue();
      if (!COLOMBIAN_DATA[department]?.includes(city)) {
        this.alertService.showWarning(
          'Ciudad Inválida',
          'Por favor selecciona una ciudad de la lista desplegable.',
        );
        return;
      }

      this.isSaving = true;
      const updateData = {
        name: this.branchForm.value.name,
        city: this.branchForm.value.city,
        address: this.branchForm.value.address,
      };

      this.branchService.update(this.branchId, updateData).subscribe({
        next: () => {
          this.alertService.showSuccess('Éxito', 'Sede actualizada correctamente');
          this.router.navigate(['/dashboard/branches']);
        },
        error: (err) => {
          this.isSaving = false;
          this.alertService.showError('Error', err.error?.message || 'No se pudo actualizar la sede.');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/branches']);
  }
}
