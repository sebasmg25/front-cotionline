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
        MatAutocompleteModule
    ],
    templateUrl: './edit-user.html',
    styleUrl: './edit-user.css',
})
export class EditUser implements OnInit {
    userForm!: FormGroup;
    userId: string | null = null;
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
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        this.userForm = this.fb.group({
            identification: ['', [Validators.required, Validators.minLength(5)]],
            name: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            department: ['', [Validators.required]],
            city: [{ value: '', disabled: true }, [Validators.required]],
            password: ['']
        });

        this.setupGeographyFilters();

        this.route.paramMap.subscribe(params => {
            this.userId = params.get('id') || '1';
            if (this.userId) {
                this.loadUserData(this.userId);
            }
        });
    }

    private setupGeographyFilters(): void {
        // Department Filter
        this.filteredDepartments$ = this.userForm.get('department')!.valueChanges.pipe(
            startWith(''),
            rxMap(value => this._filter(value || '', this.departments))
        );

        // Department Selection Logic (enable/disable city)
        this.userForm.get('department')!.valueChanges.subscribe(dept => {
            const cityControl = this.userForm.get('city')!;
            if (this.departments.includes(dept)) {
                cityControl.enable();
                // Filter cities for this department
                const availableCities = COLOMBIAN_DATA[dept] || [];
                this.filteredCities$ = cityControl.valueChanges.pipe(
                    startWith(''),
                    rxMap(value => this._filter(value || '', availableCities))
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

    loadUserData(id: string): void {
        this.isLoading = true;
        this.userService.findById(id).subscribe({
            next: (user) => {
                this.currentUser = user;
                this.userForm.patchValue({
                    identification: user.identification,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    department: user.department,
                    city: user.city,
                    password: user.password
                });
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading user', error);
                this.userNotFound = true;
                this.isLoading = false;
            }
        });
    }

    onSubmit(): void {
        if (this.userForm.valid && this.userId) {
            this.isSaving = true;
            this.userService.update(this.userId, this.userForm.value).subscribe({
                next: (updatedUser) => {
                    console.log('Usuario Actualizado:', updatedUser);
                    this.alertService.showSuccess('¡Éxito!', 'Perfil actualizado exitosamente');
                    this.isSaving = false;
                    this.router.navigate(['/dashboard']);
                },
                error: (error) => {
                    console.error('Error updating user', error);
                    this.isSaving = false;
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard']);
    }
}