import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CollaboratorInvitation, InvitationStatus } from '../../../contexts/collaborator/domain/models/collaborator.model';

@Injectable({
    providedIn: 'root'
})
export class CollaboratorService {
    private invitations: CollaboratorInvitation[] = [
        {
            id: 'inv1',
            email: 'colab1@example.com',
            status: 'accepted',
            sentAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
            respondedAt: new Date(Date.now() - 86400000)   // 1 day ago
        },
        {
            id: 'inv2',
            email: 'colab2@example.com',
            status: 'rejected',
            sentAt: new Date(Date.now() - 86400000),
            respondedAt: new Date()
        },
        {
            id: 'inv3',
            email: 'colab3@example.com',
            status: 'pending',
            sentAt: new Date()
        }
    ];

    constructor() { }

    findAllInvitations(): Observable<CollaboratorInvitation[]> {
        return of([...this.invitations]).pipe(delay(500));
    }

    invite(data: Partial<CollaboratorInvitation>): Observable<CollaboratorInvitation> {
        const newInvitation: CollaboratorInvitation = {
            id: `inv${Date.now()}`,
            email: data.email!,
            status: 'pending',
            sentAt: new Date()
        };
        this.invitations.unshift(newInvitation); // Add to start of list
        return of(newInvitation).pipe(delay(800));
    }

    deleteInvitation(id: string): Observable<void> {
        this.invitations = this.invitations.filter(inv => inv.id !== id);
        return of(undefined).pipe(delay(500));
    }
}
