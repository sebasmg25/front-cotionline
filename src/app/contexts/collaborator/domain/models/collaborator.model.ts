export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface CollaboratorInvitation {
    id: string;
    email: string;
    status: InvitationStatus;
    sentAt: Date;
    respondedAt?: Date;
}
