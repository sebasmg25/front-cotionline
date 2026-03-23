import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { AlertService } from '../../../../contexts/shared/services/alert.service';
import { Toolbar } from '../../../shared/toolbar/toolbar';
import { BusinessService } from '../../../../infraestructure/services/business/business.service';

interface DocUpload {
  name: string;
  description: string;
  status: 'pending' | 'uploaded';
  file?: File;
  backendKey: string;
}

@Component({
  selector: 'app-upload-docs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    Toolbar,
  ],
  templateUrl: './upload-docs.html',
  styleUrl: './upload-docs.css',
})
export class UploadBusinessDocs implements OnInit {
  docs: DocUpload[] = [
    {
      name: 'RUT',
      description: 'Registro Único Tributario (PDF)',
      status: 'pending',
      backendKey: 'rut',
    },
    {
      name: 'Cámara de Comercio',
      description: 'Certificado de existencia (PDF)',
      status: 'pending',
      backendKey: 'chamberOfCommerce',
    },
  ];

  isUploading: boolean = false;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private businessService: BusinessService,
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: any, doc: DocUpload): void {
    const file = event.target.files[0];
    if (file) {
      doc.file = file;
      doc.status = 'uploaded';
      this.alertService.showSuccess('Cargado', `${doc.name} se ha seleccionado correctamente.`);
    }
  }

  allDocsUploaded(): boolean {
    return this.docs.every((d) => d.status === 'uploaded');
  }

  finishRegistration(): void {
    const businessId = localStorage.getItem('pendingBusinessId');

    if (!businessId) {
      this.alertService.showError(
        'Error de flujo',
        'No se encontró el negocio pendiente. Inicia el registro de nuevo.',
      );
      this.router.navigate(['/dashboard/business/register']);
      return;
    }

    this.isUploading = true;

    const formData = new FormData();
    this.docs.forEach((doc) => {
      if (doc.file) {
        formData.append(doc.backendKey, doc.file);
      }
    });

    this.businessService.update(businessId, formData as any).subscribe({
      next: () => {
        this.isUploading = false;
        this.alertService.showSuccess(
          '¡Registro Completo!',
          'Tu negocio está en proceso de verificación.',
        );
        localStorage.removeItem('pendingBusinessId');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isUploading = false;
        console.error('Error al subir docs:', err);
        this.alertService.showError('Error', err.error?.message || 'Hubo un problema al subir los archivos.');
      },
    });
  }
}
