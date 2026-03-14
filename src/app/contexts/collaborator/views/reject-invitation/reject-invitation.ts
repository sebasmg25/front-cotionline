import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CollaboratorService } from '../../../../infraestructure/services/collaborator/collaborator.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reject-invitation',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './reject-invitation.html',
  styleUrls: ['./reject-invitation.css']
})
export class RejectInvitation implements OnInit {
  private route = inject(ActivatedRoute);
  private collaboratorService = inject(CollaboratorService);

  loading = true;
  success = false;
  error = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reject(id);
    } else {
      this.loading = false;
      this.error = true;
      this.errorMessage = 'Enlace de invitación no válido.';
    }
  }

  reject(id: string): void {
    this.collaboratorService.rejectInvitation(id).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'No se pudo rechazar la invitación. Puede que ya haya sido respondida.';
      }
    });
  }
}
