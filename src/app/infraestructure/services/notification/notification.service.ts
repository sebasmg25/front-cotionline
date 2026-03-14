import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Notification, NotificationType } from '../../../contexts/shared/models/notification.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly apiUrl = `${environment.apiUrl}/notifications`;
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    constructor(private http: HttpClient) { }

    getNotifications(): Observable<Notification[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => {
                const notifications = (res.data || res) as Notification[];
                this.notificationsSubject.next(notifications);
                return notifications;
            })
        );
    }

    getUnreadNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => !n.isRead))
        );
    }

    getReadNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => n.isRead))
        );
    }

    getUnreadCount(): Observable<number> {
        return this.getUnreadNotifications().pipe(
            map(notifications => notifications.length)
        );
    }

    markAsRead(id: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
            map(res => {
                const current = this.notificationsSubject.value;
                const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
                this.notificationsSubject.next(updated);
                return res;
            })
        );
    }

    markAllAsRead(): void {
        // El backend no parece tener un "mark all", así que lo hacemos uno por uno o lo dejamos para después
        const current = this.notificationsSubject.value;
        current.filter(n => !n.isRead).forEach(n => this.markAsRead(n.id).subscribe());
    }

    deleteNotification(id: string): void {
        // El backend no tiene delete por ahora según ví en las rutas
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => n.id !== id);
        this.notificationsSubject.next(updated);
    }
}
