import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DEPARTMENTS, COLOMBIAN_DATA } from '../../../shared/data/cities.data';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-register-user',
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
    MatCheckboxModule
  ],
  templateUrl: './register-user.html',
  styleUrl: './register-user.css',
})
export class RegisterUser implements OnInit {
  userForm!: FormGroup;
  isSaving: boolean = false;

  // Visibilidad de contraseñas
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  // Geography Data
  departments: string[] = DEPARTMENTS;
  filteredDepartments$!: Observable<string[]>;
  filteredCities$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      identification: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });

    this.setupGeographyFilters();
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  private setupGeographyFilters(): void {
    this.filteredDepartments$ = this.userForm.get('department')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.departments))
    );

    this.userForm.get('department')!.valueChanges.subscribe(dept => {
      const cityControl = this.userForm.get('city')!;
      if (this.departments.includes(dept)) {
        cityControl.enable();
        const availableCities = COLOMBIAN_DATA[dept] || [];
        this.filteredCities$ = cityControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value || '', availableCities))
        );
      } else {
        cityControl.disable();
        cityControl.setValue('');
      }
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSaving = true;
      this.userService.save(this.userForm.value).subscribe({
        next: (response) => {
          this.alertService.showSuccess('¡Paso 1 completado!', 'Usuario registrado. Ahora registra tu negocio.');
          this.isSaving = false;
          this.router.navigate(['/dashboard/register-business']);
        },
        error: (error) => {
          console.error('Error registering user', error);
          this.isSaving = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
