import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Sidenav } from '../../../contexts/shared/sidenav/sidenav';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { GuideService } from '../../../contexts/shared/services/guide.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WelcomeDialog } from '../../../contexts/shared/components/welcome-dialog/welcome-dialog';
import { TutorialStep } from '../../../contexts/shared/components/tutorial-step/tutorial-step';
import { CommonModule } from '@angular/common';

// Material Imports for the Layout Shell
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, map, shareReplay } from 'rxjs';
import { NotificationService } from '../../../infraestructure/services/notification/notification.service';
import { Notification } from '../../../contexts/shared/models/notification.model';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Sidenav,
    RouterOutlet,
    RouterModule,
    TutorialStep,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  @ViewChild('drawer') drawer: any;
  unreadCount$: Observable<number>;
  allNotifications$: Observable<Notification[]>;
  unreadNotifications$: Observable<Notification[]>;
  readNotifications$: Observable<Notification[]>;

  private breakpointObserver = inject(BreakpointObserver);
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private guideService: GuideService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
    this.allNotifications$ = this.notificationService.getNotifications();
    this.unreadNotifications$ = this.notificationService.getUnreadNotifications();
    this.readNotifications$ = this.notificationService.getReadNotifications();
  }

  ngOnInit(): void {
    if (this.guideService.isFirstTimeUser()) {
      setTimeout(() => {
        const dialogRef = this.dialog.open(WelcomeDialog, {
          width: '500px',
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(startTour => {
          this.guideService.markWelcomeAsSeen();
          if (startTour) {
            this.guideService.startGuide('welcome_tour');
          }
        });
      }, 1000);
    }
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'invitation': return 'person_add';
      case 'status_change': return 'sync';
      case 'reminder': return 'notifications';
      case 'deadline': return 'event_busy';
      default: return 'notifications';
    }
  }

  startContextGuide(): void {
    const url = this.router.url;
    if (url.includes('/dashboard/quotations')) {
      this.guideService.startGuide('create_request');
    } else {
      this.guideService.startGuide('welcome_tour');
    }
  }
}
