import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationService } from '../../../../infraestructure/services/notification/notification.service';
import { Notification, NotificationType } from '../../../shared/models/notification.model';
import { Observable, combineLatest, map } from 'rxjs';
import { AlertService } from '../../../../contexts/shared/services/alert.service';

@Component({
    selector: 'app-notification-center',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatCheckboxModule,
        MatTabsModule,
        MatTooltipModule,
        MatDividerModule
    ],
    templateUrl: './notification-center.html',
    styleUrl: './notification-center.css'
})
export class NotificationCenter implements OnInit {
    notifications$: Observable<Notification[]>;
    unreadNotifications$: Observable<Notification[]>;
    readNotifications$: Observable<Notification[]>;

    selection = new SelectionModel<Notification>(true, []);
    displayedColumns: string[] = ['select', 'type', 'content', 'date', 'actions'];

    constructor(
        private notificationService: NotificationService,
        private alertService: AlertService,
        private router: Router
    ) {
        this.notifications$ = this.notificationService.getNotifications();
        this.unreadNotifications$ = this.notificationService.getUnreadNotifications();
        this.readNotifications$ = this.notificationService.getReadNotifications();
    }

    ngOnInit(): void { }

    getNotificationIcon(type: string): string {
        switch (type) {
            case 'TEAM': return 'person_add';
            case 'TRANSACTIONAL': return 'sync_alt';
            case 'SYSTEM': return 'notifications_active';
            default: return 'notifications';
        }
    }

    isAllSelected(notifications: Notification[]): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = notifications.length;
        return numSelected === numRows;
    }

    toggleAll(notifications: Notification[]): void {
        this.isAllSelected(notifications) ?
            this.selection.clear() :
            notifications.forEach(row => this.selection.select(row));
    }

    openNotification(n: Notification): void {
        if (!n.isRead) {
            this.notificationService.markAsRead(n.id).subscribe();
        }
        this.router.navigate(['/dashboard/notifications', n.id]);
    }

    markAsRead(n: Notification): void {
        this.notificationService.markAsRead(n.id).subscribe();
    }

    markSelectedAsRead(): void {
        const ids = this.selection.selected.map(n => n.id);
        ids.forEach(id => this.notificationService.markAsRead(id).subscribe());
        this.selection.clear();
        this.alertService.showSuccess('Actualizado', 'Notificaciones marcadas como leídas');
    }
}
