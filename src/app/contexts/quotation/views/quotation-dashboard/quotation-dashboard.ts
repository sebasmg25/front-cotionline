import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { QuotationService } from '../../../../infraestructure/services/quotation/quotation.service';
import { Quotation } from '../../domain/models/quotation.model';
import { QuotationRequest } from '../../../quotationRequest/domain/models/quotation-request.model';
import { Observable, delay, of, startWith, switchMap, tap, catchError, Subscription } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../infraestructure/services/auth/auth.service';
import { COLOMBIAN_DATA, DEPARTMENTS } from '../../../shared/data/cities.data';

@Component({
  selector: 'app-quotation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule,
    MatTooltipModule,
    RouterModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quotation-dashboard.html',
  styleUrl: './quotation-dashboard.css',
})
export class QuotationDashboard implements OnInit {
  sentQuotations$: Observable<Quotation[]>;
  receivedQuotations$: Observable<Quotation[]>;
  incomingRequests: QuotationRequest[] = [];
  draftQuotations$: Observable<Quotation[]>;
  private marketplaceSubscription?: Subscription;

  filterForm: FormGroup;
  departments = DEPARTMENTS;
  cities: string[] = [];
  isMarketplaceLoading = true;

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

    // Listen to department changes to update city list
    this.filterForm.get('department')?.valueChanges.subscribe(dept => {
      this.cities = dept ? COLOMBIAN_DATA[dept] || [] : [];
      this.filterForm.get('city')?.setValue('');
    });

    // Inicialización de flujos desde el servicio corregido
    this.sentQuotations$ = this.quotationService.getSentQuotations();
    this.receivedQuotations$ = this.quotationService.getReceivedQuotations();
    this.draftQuotations$ = this.quotationService.getDraftQuotations();

    // Reactive filtering for incoming requests - subscribed manually to avoid *ngIf deadlock
    this.marketplaceSubscription = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value),
      delay(0), // Evita ExpressionChangedAfterItHasBeenCheckedError
      tap(() => this.isMarketplaceLoading = true),
      switchMap(filters => this.quotationService.getIncomingRequests({
        department: filters.department || undefined,
        city: filters.city || undefined
      }).pipe(
        catchError(err => {
          console.error('[QuotationDashboard] Error fetching incoming requests:', err);
          return of([]);
        })
      )),
      tap(res => {
        this.incomingRequests = res;
        this.isMarketplaceLoading = false;
      })
    ).subscribe();
  }

  ngOnInit(): void {
    this.setDefaultLocation();
  }

  ngOnDestroy(): void {
    this.marketplaceSubscription?.unsubscribe();
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
      error: err => console.error('[QuotationDashboard] Error loading user session:', err)
    });
  }

  respondRequest(requestId: string | undefined): void {
    if (requestId) {
      this.router.navigate(['/dashboard/quotation-management/respond', requestId]);
    }
  }

  editDraft(quotationId: string | undefined): void {
    if (quotationId) {
      this.router.navigate(['/dashboard/quotation-management/edit', quotationId]);
    }
  }

  viewQuotation(id: string): void {
    if (id) {
      this.router.navigate(['/dashboard/quotation-management/detail', id]);
    }
  }

  compareQuotations(requestId: string): void {
    if (requestId) {
      this.router.navigate(['/dashboard/quotation-management/compare', requestId]);
    }
  }

  viewAllMarketplace(): void {
    this.router.navigate(['/dashboard/quotations/marketplace']);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
