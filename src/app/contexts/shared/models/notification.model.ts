export type NotificationType = 'status_change' | 'invitation' | 'reminder' | 'deadline';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    link?: string; // Optional path to navigate to
}
