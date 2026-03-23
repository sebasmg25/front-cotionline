import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule } from '@angular/router';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { QuotationRequest } from '../../domain/models/quotation-request.model';
import { Observable, delay, of, startWith, switchMap, tap, catchError, Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../infraestructure/services/auth/auth.service';
import { COLOMBIAN_DATA, DEPARTMENTS } from '../../../shared/data/cities.data';

@Component({
  selector: 'app-marketplace-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    RouterModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './marketplace-requests.html',
  styleUrl: './marketplace-requests.css',
})
export class MarketplaceRequests implements OnInit, OnDestroy {
  incomingRequests: QuotationRequest[] = [];
  filterForm: FormGroup;
  
  departments = DEPARTMENTS;
  cities: string[] = [];
  isLoading = true;
  private marketplaceSubscription?: Subscription;

  constructor(
    private quotationService: QuotationService,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      department: [''],
      city: ['']
    });

    this.filterForm.get('department')?.valueChanges.subscribe(dept => {
      this.cities = dept ? COLOMBIAN_DATA[dept] || [] : [];
      this.filterForm.get('city')?.setValue('');
    });
  }

  ngOnInit(): void {
    this.marketplaceSubscription = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      delay(0),
      tap(() => this.isLoading = true),
      switchMap(filters => this.quotationService.getIncomingRequests({
        department: filters.department || undefined,
        city: filters.city || undefined
      }).pipe(
        catchError(err => {
          console.error('[MarketplaceRequests] Error fetching incoming requests:', err);
          return of([]);
        })
      )),
      tap(res => {
        this.incomingRequests = res;
        this.isLoading = false;
      })
    ).subscribe();

    this.setDefaultLocation();
  }

  private setDefaultLocation(): void {
    this.authService.getUserSession().subscribe({
      next: session => {
        const user = session?.user;
        if (user?.department) {
          this.filterForm.patchValue({
            department: user.department,
            city: user.city || ''
          });
        }
      },
      error: err => console.error('[MarketplaceRequests] Error loading user session:', err)
    });
  }

  ngOnDestroy(): void {
    this.marketplaceSubscription?.unsubscribe();
  }

  respondRequest(requestId: string | undefined): void {
    if (requestId) {
      this.router.navigate(['/dashboard/quotation-management/respond', requestId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/quotation-management']);
  }
}
