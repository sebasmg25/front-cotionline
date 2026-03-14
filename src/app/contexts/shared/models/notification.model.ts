export type NotificationType = 'TRANSACTIONAL' | 'SYSTEM' | 'TEAM';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    link: string;
    userId: string;
}
