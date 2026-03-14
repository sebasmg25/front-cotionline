import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CollaboratorService } from '../../../../infraestructure/services/collaborator/collaborator.service';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { CollaboratorInvitation } from '../../domain/models/collaborator.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-collaborator-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatDividerModule,
        MatTooltipModule
    ],
    templateUrl: './collaborator-management.html',
    styleUrl: './collaborator-management.css'
})
export class CollaboratorManagement implements OnInit {
    inviteForm: FormGroup;
    invitations$: Observable<CollaboratorInvitation[]>;
    activeCollaborators$: Observable<any[]>;
    displayedInvitationsColumns: string[] = ['email', 'invitationStatus', 'createdAt', 'actions'];
    displayedActiveColumns: string[] = ['name', 'email', 'department', 'actions'];
    isSaving: boolean = false;

    constructor(
        private fb: FormBuilder,
        private collaboratorService: CollaboratorService,
        private alertService: AlertService
    ) {
        this.inviteForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
        this.invitations$ = this.collaboratorService.findAllInvitations();
        this.activeCollaborators$ = this.collaboratorService.findActiveCollaborators();
    }

    ngOnInit(): void { }

    sendInvitation(): void {
        if (this.inviteForm.invalid) return;

        this.isSaving = true;
        this.collaboratorService.invite(this.inviteForm.value).subscribe({
            next: (newInv) => {
                this.isSaving = false;
                this.inviteForm.reset();
                this.alertService.showSuccess('Invitación Enviada', `Se ha invitado a ${newInv.email}`);
                this.refreshList();
            },
            error: () => {
                this.isSaving = false;
                this.alertService.showError('Error', 'No se pudo enviar la invitación');
            }
        });
    }

    cancelForm(): void {
        this.inviteForm.reset();
    }

    deleteInvitation(inv: CollaboratorInvitation): void {
        this.alertService.confirmAction(
            '¿Eliminar Invitación?',
            `Se cancelará la invitación para ${inv.email}.`,
            'Eliminar',
            'Cancelar'
        ).then(confirmed => {
            if (confirmed) {
                this.collaboratorService.deleteInvitation(inv.id).subscribe(() => {
                    this.alertService.showSuccess('Eliminado', 'La invitación ha sido eliminada');
                    this.refreshList();
                });
            }
        });
    }

    private refreshList(): void {
        this.invitations$ = this.collaboratorService.findAllInvitations();
        this.activeCollaborators$ = this.collaboratorService.findActiveCollaborators();
    }

    deleteActiveCollaborator(collab: any): void {
        this.alertService.confirmAction(
            '¿Revocar Acceso?',
            `Se eliminará la cuenta de ${collab.name || collab.email} permanentemente.`,
            'REVOCAR',
            'Cancelar'
        ).then((confirmed) => {
            if (confirmed) {
                this.collaboratorService.deleteActiveCollaborator(collab.id).subscribe({
                    next: () => {
                        this.alertService.showSuccess('Eliminado', 'La cuenta del colaborador ha sido eliminada.');
                        this.refreshList();
                    },
                    error: (err) => {
                        this.alertService.showError('Error', err.error?.message || 'No se pudo eliminar el colaborador.');
                    }
                });
            }
        });
    }
}
