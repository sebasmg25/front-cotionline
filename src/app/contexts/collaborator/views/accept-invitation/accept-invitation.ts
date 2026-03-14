import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CollaboratorService } from '../../../../infraestructure/services/collaborator/collaborator.service';
import { AlertService } from '../../../shared/services/alert.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-accept-invitation',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatButtonModule, MatIconModule],
  templateUrl: './accept-invitation.html',
  styleUrls: ['./accept-invitation.css']
})
export class AcceptInvitation implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private collaboratorService = inject(CollaboratorService);
  private alertService = inject(AlertService);

  loading = true;
  success = false;
  error = false;
  errorMessage = '';
  acceptedEmail = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.accept(id);
    } else {
      this.loading = false;
      this.error = true;
      this.errorMessage = 'Enlace de invitación no válido.';
    }
  }

  accept(id: string): void {
    this.collaboratorService.acceptInvitation(id).subscribe({
      next: (res) => {
        this.loading = false;
        this.success = true;
        this.acceptedEmail = res.data?.email || '';
        this.alertService.showSuccess('¡Invitación Aceptada!', 'Ya puedes registrarte para empezar a colaborar.');
      },
      error: (err) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.message || 'No se pudo procesar la invitación. Puede que ya haya expirado o haya sido aceptada.';
      }
    });
  }

  goToRegister(): void {
    if (this.acceptedEmail) {
      this.router.navigate(['/register'], { queryParams: { email: this.acceptedEmail } });
    } else {
      this.router.navigate(['/register']);
    }
  }
}
