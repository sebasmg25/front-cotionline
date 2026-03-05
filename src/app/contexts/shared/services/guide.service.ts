import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

export interface GuideStep {
    elementId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export interface Guide {
    id: string;
    name: string;
    steps: GuideStep[];
}

@Injectable({
    providedIn: 'root'
})
export class GuideService {
    private activeGuideSubject = new BehaviorSubject<Guide | null>(null);
    private currentStepIndexSubject = new BehaviorSubject<number>(0);

    private guides: Guide[] = [
        {
            id: 'welcome_tour',
            name: 'Tour de Bienvenida',
            steps: [
                {
                    elementId: 'sidenav-inicio',
                    title: 'Panel de Inicio',
                    content: 'Aquí encontrarás un resumen rápido de tus actividades principales.',
                    position: 'right'
                },
                {
                    elementId: 'notif-bell',
                    title: 'Notificaciones',
                    content: 'Mantente al tanto de cambios en tus cotizaciones e invitaciones.',
                    position: 'bottom'
                },
                {
                    elementId: 'help-button',
                    title: 'Centro de Ayuda',
                    content: 'Si te pierdes, siempre puedes consultar las guías aquí.',
                    position: 'bottom'
                }
            ]
        },
        {
            id: 'create_request',
            name: 'Cómo Crear una Solicitud',
            steps: [
                {
                    elementId: 'btn-new-request',
                    title: 'Nueva Solicitud',
                    content: 'Haz clic aquí para comenzar a redactar tu solicitud de cotización.',
                    position: 'top'
                }
            ]
        },
        {
            id: 'quotations_guide',
            name: 'Guía de Cotizaciones',
            steps: [
                {
                    elementId: 'guide-incoming-requests',
                    title: 'Cotizaciones Recibidas',
                    content: 'Aquí verás las ofertas que otros proveedores han enviado para tus solicitudes actuales.',
                    position: 'bottom'
                },
                {
                    elementId: 'guide-quotation-tabs',
                    title: 'Mis Cotizaciones',
                    content: 'Puedes alternar entre las cotizaciones que has enviado y las que has recibido para gestionarlas fácilmente.',
                    position: 'top'
                }
            ]
        },
        {
            id: 'analysis_guide',
            name: 'Guía de Análisis y Comparación',
            steps: [
                {
                    elementId: 'guide-analysis-requests',
                    title: 'Selección de Solicitud',
                    content: 'Primero, selecciona una de tus solicitudes enviadas para comenzar a comparar las ofertas que tiene.',
                    position: 'bottom'
                },
                {
                    elementId: 'guide-generate-comparison',
                    title: 'Comparación Inteligente',
                    content: 'Una vez selecciones al menos 2 ofertas, podrás generar una tabla comparativa automática de precios y tiempos.',
                    position: 'top'
                }
            ]
        },
        {
            id: 'branches_guide',
            name: 'Gestión de Sedes',
            steps: [
                {
                    elementId: 'guide-new-branch',
                    title: 'Añadir Nueva Sede',
                    content: 'Pulsa aquí para registrar un nuevo punto de atención para tu negocio.',
                    position: 'bottom'
                },
                {
                    elementId: 'guide-branches-table',
                    title: 'Listado de Sedes',
                    content: 'Aquí podrás ver, editar o eliminar todas las sedes registradas actualmente.',
                    position: 'top'
                }
            ]
        },
        {
            id: 'collaborators_guide',
            name: 'Guía de Colaboradores',
            steps: [
                {
                    elementId: 'guide-new-user',
                    title: 'Nuevo Colaborador',
                    content: 'Agrega a otros miembros de tu organización para que puedan participar en el flujo de cotizaciones.',
                    position: 'bottom'
                },
                {
                    elementId: 'guide-users-table',
                    title: 'Gestión de Personal',
                    content: 'Administra los roles y la información de tus colaboradores registrados en el sistema.',
                    position: 'top'
                }
            ]
        }
    ];

    constructor(private dialog: MatDialog) { }

    getAvailableGuides(): Guide[] {
        return this.guides;
    }

    getActiveGuide(): Observable<Guide | null> {
        return this.activeGuideSubject.asObservable();
    }

    getCurrentStepIndex(): Observable<number> {
        return this.currentStepIndexSubject.asObservable();
    }

    startGuide(guideId: string): void {
        const guide = this.guides.find(g => g.id === guideId);
        if (guide) {
            this.activeGuideSubject.next(guide);
            this.currentStepIndexSubject.next(0);
        }
    }

    nextStep(): void {
        const currentGuide = this.activeGuideSubject.value;
        const currentIndex = this.currentStepIndexSubject.value;

        if (currentGuide && currentIndex < currentGuide.steps.length - 1) {
            this.currentStepIndexSubject.next(currentIndex + 1);
        } else {
            this.endGuide();
        }
    }

    endGuide(): void {
        this.activeGuideSubject.next(null);
        this.currentStepIndexSubject.next(0);
    }

    isFirstTimeUser(): boolean {
        return !localStorage.getItem('has_seen_welcome');
    }

    markWelcomeAsSeen(): void {
        localStorage.setItem('has_seen_welcome', 'true');
    }
}
