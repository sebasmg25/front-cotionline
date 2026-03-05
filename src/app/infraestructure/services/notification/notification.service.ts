import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Notification, NotificationType } from '../../../contexts/shared/models/notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<Notification[]>([
        {
            id: 'n1',
            type: 'invitation',
            title: 'Nueva Invitación',
            message: 'Has sido invitado a colaborar con el negocio "Suministros Globales".',
            read: false,
            createdAt: new Date(),
            link: '/dashboard/collaborators'
        },
        {
            id: 'n2',
            type: 'status_change',
            title: 'Cotización Aceptada',
            message: 'Tu cotización para "Papelería Mes de Marzo" ha sido aceptada.',
            read: false,
            createdAt: new Date(Date.now() - 3600000), // 1 hour ago
            link: '/dashboard/quotation-management'
        },
        {
            id: 'n3',
            type: 'deadline',
            title: 'Fecha de Expiración Próxima',
            message: 'La solicitud "Insumos de Limpieza" expira mañana.',
            read: true,
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            link: '/dashboard/quotations'
        }
    ]);

    notifications$ = this.notificationsSubject.asObservable();

    constructor() { }

    getNotifications(): Observable<Notification[]> {
        return this.notifications$;
    }

    getUnreadNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => !n.read))
        );
    }

    getReadNotifications(): Observable<Notification[]> {
        return this.notifications$.pipe(
            map(notifications => notifications.filter(n => n.read))
        );
    }

    getUnreadCount(): Observable<number> {
        return this.getUnreadNotifications().pipe(
            map(notifications => notifications.length)
        );
    }

    markAsRead(id: string): void {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
        this.notificationsSubject.next(updated);
    }

    markAllAsRead(): void {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(updated);
    }

    deleteNotification(id: string): void {
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => n.id !== id);
        this.notificationsSubject.next(updated);
    }

    markMultipleAsRead(ids: string[]): void {
        const current = this.notificationsSubject.value;
        const updated = current.map(n => ids.includes(n.id) ? { ...n, read: true } : n);
        this.notificationsSubject.next(updated);
    }

    deleteMultiple(ids: string[]): void {
        const current = this.notificationsSubject.value;
        const updated = current.filter(n => !ids.includes(n.id));
        this.notificationsSubject.next(updated);
    }
}
