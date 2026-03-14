import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEPARTMENTS, COLOMBIAN_DATA } from '../../shared/data/cities.data';
import { User, UserRole } from '../../user/domain/models/user.model';
import { AuthService } from '../../../infraestructure/services/auth/auth.service'; // Cambio de servicio
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AlertService } from '../../shared/services/alert.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
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
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const invitedEmail = this.route.snapshot.queryParamMap.get('email');

    this.registerForm = this.fb.group(
      {
        identification: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(10),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        name: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: [
          { value: invitedEmail || '', disabled: !!invitedEmail },
          [Validators.required, Validators.email],
        ],
        department: ['', [Validators.required]],
        city: [{ value: '', disabled: true }, [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(12),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/,
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    );

    this.setupGeographyFilters();
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  private setupGeographyFilters(): void {
    this.filteredDepartments$ = this.registerForm.get('department')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '', this.departments)),
    );

    this.registerForm.get('department')!.valueChanges.subscribe((dept) => {
      const cityControl = this.registerForm.get('city')!;
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
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(filterValue));
  }

  registerUser() {
    if (this.registerForm.invalid) {
      this.alertService.showInfo(
        'Formulario incompleto',
        'Por favor verifica que todos los campos sean correctos y hayas aceptado los términos.',
      );
      return;
    }

    const { confirmPassword, acceptTerms, ...userData } = this.registerForm.getRawValue();
    const newUser = userData as User;

    this.isSaving = true;

    // Ahora usamos authService.register
    this.authService.register(newUser).subscribe({
      next: (response) => {
        // El interceptor ya sabe qué hacer, pero guardamos el token para futuras recargas
        this.authService.saveToken(response.token);

        if (response.user.role === UserRole.COLLABORATOR) {
          this.alertService.showSuccess(
            '¡Bienvenido!',
            'Has sido registrado como colaborador exitosamente.',
          );
          this.router.navigate(['/dashboard']);
        } else {
          this.alertService.showSuccess(
            '¡Paso 1 completado!',
            'Usuario registrado. Ahora registra tu negocio.',
          );
          this.router.navigate(['/register-business']);
        }
        this.registerForm.reset();
        this.isSaving = false;
      },
      error: (err) => {
        this.isSaving = false;
        // Extraemos el mensaje de error que viene de nuestro controlador del Back
        const errorMessage =
          err.error?.message || 'No se pudo completar el registro. Inténtalo de nuevo.';
        this.alertService.showError('Error de registro', errorMessage);
        console.error('Error en el registro:', err);
      }
    });
  }
}
