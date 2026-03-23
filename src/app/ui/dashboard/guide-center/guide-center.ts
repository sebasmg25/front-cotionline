import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService, Guide } from '../../../contexts/shared/services/guide.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide-center',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="guide-center-container">
      <header class="page-header">
        <h1>Centro de Guías</h1>
        <p>Aprende a sacar el máximo provecho de CotiOnline con nuestros tutoriales interactivos.</p>
      </header>

      <div class="guides-grid">
        <mat-card *ngFor="let guide of guides" class="guide-card">
          <mat-card-header>
            <div mat-card-avatar class="guide-avatar">
              <mat-icon>{{ getIconForGuide(guide.id) }}</mat-icon>
            </div>
            <mat-card-title>{{ guide.name }}</mat-card-title>
            <mat-card-subtitle>{{ guide.steps.length }} pasos</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Aprende paso a paso cómo utilizar esta funcionalidad de manera efectiva.</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button mat-raised-button color="primary" (click)="startGuide(guide.id)">
              INICIAR GUÍA
              <mat-icon>play_circle</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .guide-center-container { padding: 60px 40px; background: var(--soft-bg); min-height: 100%; }
    .page-header { margin-bottom: 50px; text-align: center; }
    .page-header h1 { font-size: 44px; font-weight: 800; color: var(--primary-dark); letter-spacing: -1.5px; margin-bottom: 10px; }
    .page-header p { font-size: 18px; color: #666; }
    .guides-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; max-width: 1400px; margin: 0 auto; }
    .guide-card { 
      background: rgba(255, 255, 255, 0.7) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      border-radius: 24px !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      padding: 10px;
    }
    .guide-card:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(0, 28, 48, 0.1) !important; border-color: rgba(23, 107, 135, 0.2) !important; }
    .guide-avatar { 
      display: flex; align-items: center; justify-content: center; 
      background: linear-gradient(135deg, rgba(0, 28, 48, 0.05), rgba(23, 107, 135, 0.05));
      border-radius: 16px; width: 48px; height: 48px;
    }
    .guide-avatar mat-icon { color: var(--primary-dark); }
    mat-card-title { font-size: 20px !important; font-weight: 700 !important; color: var(--primary-dark) !important; }
    mat-card-subtitle { font-weight: 600 !important; color: var(--primary-dark) !important; opacity: 0.6; }
    mat-card-content p { color: #666; font-size: 15px; margin-top: 15px; line-height: 1.5; }
    mat-card-actions { padding: 16px !important; }
    .start-button { height: 48px !important; padding: 0 24px !important; font-weight: 700 !important; border-radius: 12px !important; background: var(--primary-dark) !important; color: white !important; }
  `]
})
export class GuideCenter implements OnInit {
  guides: Guide[] = [];

  constructor(private guideService: GuideService, private router: Router) { }

  ngOnInit(): void {
    this.guides = this.guideService.getAvailableGuides();
  }

  getIconForGuide(id: string): string {
    const icons: { [key: string]: string } = {
      'welcome_tour': 'auto_awesome',
      'create_request': 'post_add',
      'quotations_guide': 'receipt_long',
      'analysis_guide': 'analytics',
      'branches_guide': 'storefront',
      'collaborators_guide': 'group'
    };
    return icons[id] || 'help_outline';
  }

  startGuide(guideId: string): void {
    const routeMap: { [key: string]: string } = {
      'create_request': '/dashboard/quotations',
      'quotations_guide': '/dashboard/quotation-management',
      'analysis_guide': '/dashboard/quotation-management/comparison',
      'branches_guide': '/dashboard/branches',
      'collaborators_guide': '/dashboard/collaborators'
    };

    const targetRoute = routeMap[guideId];
    if (targetRoute) {
      this.router.navigate([targetRoute]).then(() => {
        setTimeout(() => this.guideService.startGuide(guideId), 600);
      });
    } else {
      this.guideService.startGuide(guideId);
    }
  }
}
