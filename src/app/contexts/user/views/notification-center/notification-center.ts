import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
        private alertService: AlertService
    ) {
        this.notifications$ = this.notificationService.getNotifications();
        this.unreadNotifications$ = this.notificationService.getUnreadNotifications();
        this.readNotifications$ = this.notificationService.getReadNotifications();
    }

    ngOnInit(): void { }

    getNotificationIcon(type: NotificationType): string {
        switch (type) {
            case 'invitation': return 'person_add';
            case 'status_change': return 'sync_alt';
            case 'reminder': return 'notifications_active';
            case 'deadline': return 'event_busy';
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

    markAsRead(n: Notification): void {
        this.notificationService.markAsRead(n.id);
    }

    deleteNotification(n: Notification): void {
        this.notificationService.deleteNotification(n.id);
        this.selection.deselect(n);
    }

    markSelectedAsRead(): void {
        const ids = this.selection.selected.map(n => n.id);
        this.notificationService.markMultipleAsRead(ids);
        this.selection.clear();
        this.alertService.showSuccess('Actualizado', 'Notificaciones marcadas como leídas');
    }

    deleteSelected(): void {
        this.alertService.confirmAction(
            '¿Eliminar seleccionadas?',
            `Estás por eliminar ${this.selection.selected.length} notificaciones.`,
            'Eliminar',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                const ids = this.selection.selected.map(n => n.id);
                this.notificationService.deleteMultiple(ids);
                this.selection.clear();
                this.alertService.showSuccess('Eliminado', 'Notificaciones eliminadas correctamente');
            }
        });
    }
}
