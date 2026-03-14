export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface CollaboratorInvitation {
    id: string;
    email: string;
    invitationStatus: InvitationStatus;
    createdAt: Date;
    userId: string;
}
