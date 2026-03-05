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

interface DocUpload {
    name: string;
    description: string;
    status: 'pending' | 'uploaded';
    file?: File;
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
        Toolbar
    ],
    templateUrl: './upload-docs.html',
    styleUrl: './upload-docs.css'
})
export class UploadBusinessDocs implements OnInit {
    docs: DocUpload[] = [
        { name: 'RUT', description: 'Registro Único Tributario (PDF)', status: 'pending' },
        { name: 'Cámara de Comercio', description: 'Certificado de existencia (PDF - No mayor a 30 días)', status: 'pending' }
    ];

    isUploading: boolean = false;

    constructor(
        private router: Router,
        private alertService: AlertService
    ) { }

    ngOnInit(): void { }

    onFileSelected(event: any, doc: DocUpload): void {
        const file = event.target.files[0];
        if (file) {
            doc.file = file;
            doc.status = 'uploaded';
            this.alertService.showSuccess('Cargado', `${doc.name} se ha subido correctamente.`);
        }
    }

    allDocsUploaded(): boolean {
        return this.docs.every(d => d.status === 'uploaded');
    }

    finishRegistration(): void {
        if (!this.allDocsUploaded()) {
            this.alertService.showInfo('Faltan documentos', 'Debes cargar todos los documentos requeridos para finalizar.');
            return;
        }

        this.isUploading = true;
        this.alertService.showSuccess('¡Registro Completo!', 'Tu cuenta y negocio han sido registrados. Ahora puedes iniciar sesión.');

        // Final redirection to Login
        setTimeout(() => {
            this.router.navigate(['/login']);
        }, 2000);
    }
}
