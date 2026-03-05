import { Component, Input, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideService, GuideStep } from '../../services/guide.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tutorial-step',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div *ngIf="activeStep" class="tutorial-overlay">
      <mat-card class="tutorial-card glass-card" [ngStyle]="cardStyle">
        <mat-card-header>
          <mat-card-title>{{ activeStep.title }}</mat-card-title>
          <button mat-icon-button (click)="close()" class="close-btn">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <p>{{ activeStep.content }}</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <span class="step-counter">Paso {{ currentStepIndex + 1 }} de {{ totalSteps }}</span>
          <button mat-raised-button color="primary" (click)="next()" class="next-button">
            {{ isLastStep ? 'FINALIZAR' : 'SIGUIENTE' }}
          </button>
        </mat-card-actions>
        <div class="arrow" [ngClass]="activeStep.position"></div>
      </mat-card>
    </div>
  `,
  styles: [`
    .tutorial-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 10000; }
    .tutorial-card { 
      position: absolute; width: 320px; pointer-events: auto; 
      background: rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      border-radius: 20px !important;
      box-shadow: 0 15px 40px rgba(0, 28, 48, 0.15) !important;
      animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    mat-card-title { font-weight: 800 !important; color: var(--primary-dark) !important; font-size: 18px !important; margin-right: 30px; letter-spacing: -0.5px; }
    .close-btn { position: absolute; top: 12px; right: 12px; color: #888; }
    mat-card-content p { color: #555; line-height: 1.5; font-size: 14px; margin-top: 10px; }
    .step-counter { font-size: 12px; color: #999; margin-right: auto; padding-left: 16px; font-weight: 600; }
    .next-button { border-radius: 10px !important; font-weight: 700 !important; height: 36px !important; padding: 0 16px !important; background: var(--primary-dark) !important; color: white !important; }
    .arrow { position: absolute; width: 0; height: 0; border: 10px solid transparent; }
    .arrow.bottom { border-top-color: rgba(255, 255, 255, 0.9); bottom: -20px; left: 50%; transform: translateX(-50%); }
    .arrow.top { border-bottom-color: rgba(255, 255, 255, 0.9); top: -20px; left: 50%; transform: translateX(-50%); }
    .arrow.left { border-right-color: rgba(255, 255, 255, 0.9); left: -20px; top: 50%; transform: translateY(-50%); }
    .arrow.right { border-left-color: rgba(255, 255, 255, 0.9); right: -20px; top: 50%; transform: translateY(-50%); }

    @keyframes bounceIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class TutorialStep implements OnInit, OnDestroy {
  activeStep: GuideStep | null = null;
  currentStepIndex = 0;
  totalSteps = 0;
  cardStyle: any = {};
  private sub = new Subscription();

  constructor(
    private guideService: GuideService,
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.sub.add(
      this.guideService.getActiveGuide().subscribe(guide => {
        this.totalSteps = guide?.steps.length || 0;
        this.updateStep();
      })
    );

    this.sub.add(
      this.guideService.getCurrentStepIndex().subscribe(index => {
        this.currentStepIndex = index;
        this.updateStep();
      })
    );

    // Listen to scroll and resize to update position
    this.renderer.listen('window', 'scroll', () => this.updatePosition());
    this.renderer.listen('window', 'resize', () => this.updatePosition());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.totalSteps - 1;
  }

  next(): void {
    this.guideService.nextStep();
  }

  close(): void {
    this.guideService.endGuide();
  }

  private updateStep(): void {
    this.guideService.getActiveGuide().subscribe(guide => {
      if (guide) {
        this.activeStep = guide.steps[this.currentStepIndex];
        setTimeout(() => this.updatePosition(), 0);
      } else {
        this.activeStep = null;
      }
    }).unsubscribe();
  }

  private updatePosition(): void {
    if (!this.activeStep) return;

    const target = document.getElementById(this.activeStep.elementId);
    if (!target) {
      console.warn(`Element with ID ${this.activeStep.elementId} not found for tutorial.`);
      return;
    }

    const rect = target.getBoundingClientRect();
    const margin = 20;

    switch (this.activeStep.position) {
      case 'bottom':
        this.cardStyle = { top: `${rect.bottom + margin}px`, left: `${rect.left + rect.width / 2 - 150}px` };
        break;
      case 'top':
        this.cardStyle = { top: `${rect.top - 200 - margin}px`, left: `${rect.left + rect.width / 2 - 150}px` };
        break;
      case 'left':
        this.cardStyle = { top: `${rect.top + rect.height / 2 - 100}px`, left: `${rect.left - 300 - margin}px` };
        break;
      case 'right':
        this.cardStyle = { top: `${rect.top + rect.height / 2 - 100}px`, left: `${rect.right + margin}px` };
        break;
    }
  }
}
