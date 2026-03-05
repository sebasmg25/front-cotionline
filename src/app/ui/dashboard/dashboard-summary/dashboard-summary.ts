import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-dashboard-summary',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
    templateUrl: './dashboard-summary.html',
    styleUrl: './dashboard-summary.css'
})
export class DashboardSummary {
    menuCards = [
        {
            title: 'Mis Cotizaciones',
            description: 'Gestiona tus cotizaciones enviadas, recibidas y compara propuestas.',
            icon: 'description',
            link: '/dashboard/quotation-management',
            color: '#3f51b5'
        },
        {
            title: 'Mis Solicitudes',
            description: 'Crea, edita y haz seguimiento a tus solicitudes de cotización.',
            icon: 'assignment',
            link: '/dashboard/quotations',
            color: '#009688'
        },
        {
            title: 'Actualizar Plan',
            description: 'Mejora tu suscripción para acceder a funciones avanzadas y límites mayores.',
            icon: 'upgrade',
            link: '/dashboard/updatePlan',
            color: '#ff9800'
        }
    ];
}
