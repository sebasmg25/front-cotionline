import { Component } from '@angular/core';

// Angular Material Imports (MUI)
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  imports: [MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {
  constructor(private router: Router) {}
  businessDashboard(): void {
    this.router.navigate(['/dashboard/business']);
  }

  branchDashboard(): void {
    this.router.navigate(['/dashboard/branch']);
  }

  quotationRequestDashboard(): void {
    this.router.navigate(['/dashboard/quotationRequest']);
  }

  updatePlanDashboard(): void {
    this.router.navigate(['/dashboard/updatePlan']);
  }
}
