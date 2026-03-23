import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BusinessService } from '../../../../infraestructure/services/business/business.service';

@Component({
  selector: 'app-business-docs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './business-docs.html',
  styleUrls: ['./business-docs.css'],
})
export class BusinessDocs implements OnInit {
  business: any;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private businessService: BusinessService,
  ) {}

  ngOnInit(): void {
    this.loadBusiness();
  }

  loadBusiness(): void {
    this.isLoading = true;

    this.businessService.findByUser().subscribe({
      next: (data) => {
        if (data) {
          this.business = data;
          this.isLoading = false;
        } else {
          this.checkPendingId();
        }
      },
      error: () => this.checkPendingId(),
    });
  }

  private checkPendingId(): void {
    const businessId = localStorage.getItem('pendingBusinessId');
    if (businessId) {
      this.businessService.findById(businessId).subscribe({
        next: (data) => {
          this.business = data;
          this.isLoading = false;
        },
        error: () => this.handleError(),
      });
    } else {
      this.handleError();
    }
  }

  private handleError(): void {
    this.isLoading = false;
    this.router.navigate(['/dashboard']);
  }

  openDoc(path: string | undefined): void {
    if (path) {
      const baseUrl = 'http://localhost:3000/';
      const cleanPath = path.replace(/\\/g, '/');
      window.open(`${baseUrl}${cleanPath}`, '_blank');
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
