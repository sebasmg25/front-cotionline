import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../../infraestructure/services/notification/notification.service';
import { Notification } from '../../../shared/models/notification.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-notification-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatDividerModule,
    ],
    templateUrl: './notification-detail.html',
    styleUrl: './notification-detail.css'
})
export class NotificationDetail implements OnInit {
    notification: Notification | null = null;
    loading = true;
    notFound = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private notificationService: NotificationService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.notFound = true;
            this.loading = false;
            return;
        }
        // Loads all notifications and finds the matching one, then marks it as read
        this.notificationService.getNotifications().subscribe({
            next: (notifications) => {
                const found = notifications.find(n => n.id === id);
                if (found) {
                    this.notification = found;
                    if (!found.isRead) {
                        this.notificationService.markAsRead(found.id).subscribe();
                    }
                } else {
                    this.notFound = true;
                }
                this.loading = false;
            },
            error: () => {
                this.notFound = true;
                this.loading = false;
            }
        });
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'TEAM': return 'person_add';
            case 'TRANSACTIONAL': return 'sync_alt';
            case 'SYSTEM': return 'notifications';
            default: return 'notifications';
        }
    }

    getTypeLabel(type: string): string {
        switch (type) {
            case 'TEAM': return 'Equipo';
            case 'TRANSACTIONAL': return 'Transaccional';
            case 'SYSTEM': return 'Sistema';
            default: return 'Notificación';
        }
    }

    navigateToLink(): void {
        const link = this.notification?.link;
        if (link) {
            console.log('Navegando hacia:', link);
            this.router.navigateByUrl(link).then(success => {
                if (!success) {
                    console.error('La navegación falló para la URL:', link);
                }
            });
        }
    }

    goBack(): void {
        this.router.navigate(['/dashboard/notifications']);
    }
}
