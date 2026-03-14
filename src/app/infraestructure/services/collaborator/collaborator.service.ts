import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CollaboratorInvitation, InvitationStatus } from '../../../contexts/collaborator/domain/models/collaborator.model';

@Injectable({
    providedIn: 'root'
})
export class CollaboratorService {
    private readonly apiUrl = `${environment.apiUrl}/collaborators`;

    constructor(private http: HttpClient) { }

    findAllInvitations(): Observable<CollaboratorInvitation[]> {
        return this.http.get<any>(this.apiUrl).pipe(
            map(res => (res.data || res) as CollaboratorInvitation[])
        );
    }

    invite(data: Partial<CollaboratorInvitation>): Observable<CollaboratorInvitation> {
        return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
            map(res => (res.data || res) as CollaboratorInvitation)
        );
    }

    deleteInvitation(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    acceptInvitation(id: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/accept`, {});
    }

    rejectInvitation(id: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/reject`, {});
    }

    findActiveCollaborators(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/active`).pipe(
            map(res => (res as any).data || res)
        );
    }

    deleteActiveCollaborator(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/active/${id}`);
    }
}
