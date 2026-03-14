import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../infraestructure/services/user/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTabsModule } from '@angular/material/tabs';
import { ChangePassword } from '../change-password/change-password';
import { SubscriptionDetails } from '../subscription-details/subscription-details';
import { DEPARTMENTS, COLOMBIAN_DATA } from '../../../../contexts/shared/data/cities.data';
import { Observable } from 'rxjs';
import { startWith, map as rxMap } from 'rxjs/operators';
import { User } from '../../domain/models/user.model';

@Component({
  selector: 'app-edit-user',
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
    MatTabsModule,
    ChangePassword,
    SubscriptionDetails,
  ],
  templateUrl: './edit-user.html',
  styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
  userForm!: FormGroup;
  // Ya no necesitamos forzar un ID '1', usaremos el perfil de la sesión
  currentUser: User | null = null;
  userNotFound: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;

  // Geography Data
  departments: string[] = DEPARTMENTS;
  filteredDepartments$!: Observable<string[]>;
  filteredCities$!: Observable<string[]>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      identification: [{ value: '', disabled: true }, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      password: [''],
    });

    this.setupGeographyFilters();

    // Cargamos el perfil directamente
    this.loadUserData();
  }

  private setupGeographyFilters(): void {
    this.filteredDepartments$ = this.userForm.get('department')!.valueChanges.pipe(
      startWith(''),
      rxMap((value) => this._filter(value || '', this.departments)),
    );

    this.userForm.get('department')!.valueChanges.subscribe((dept) => {
      const cityControl = this.userForm.get('city')!;
      if (this.departments.includes(dept)) {
        cityControl.enable();
        const availableCities = COLOMBIAN_DATA[dept] || [];
        this.filteredCities$ = cityControl.valueChanges.pipe(
          startWith(''),
          rxMap((value) => this._filter(value || '', availableCities)),
        );
      } else {
        cityControl.disable();
        cityControl.setValue('');
      }
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(filterValue));
  }

  loadUserData(): void {
    this.isLoading = true;
    // Cambio: Usamos getProfile() que no requiere ID (el back usa el Token)
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.userForm.patchValue({
          identification: user.identification,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          department: user.department,
          city: user.city,
          // No parcheamos el password por seguridad
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading user', err);
        this.userNotFound = true;
        this.isLoading = false;
        this.alertService.showError('Error', 'No se pudo cargar la información de tu cuenta.');
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSaving = true;

      // Solo enviamos los campos que el backend permite actualizar
      const formData = {
        name: this.userForm.value.name,
        lastName: this.userForm.value.lastName,
        department: this.userForm.value.department,
        city: this.userForm.value.city,
      };

      // Si hay password, lo incluimos
      const password = this.userForm.value.password;
      if (password && password.trim() !== '') {
        (formData as any).password = password;
      }

      this.userService.updateProfile(formData).subscribe({
        next: (updatedUser) => {
          console.log('Usuario Actualizado:', updatedUser);
          this.alertService.showSuccess('¡Éxito!', 'Perfil actualizado exitosamente');
          this.isSaving = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err: any) => {
          console.error('Error updating user', err);
          this.isSaving = false;
          const errorMsg = err.error?.message || 'Error al actualizar el perfil';
          this.alertService.showError('Error', errorMsg);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
