import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { QuotationRequest, QuotationStatus } from '../../../contexts/quotationRequest/domain/models/quotation-request.model';
import { QuotationRequestRepository } from '../../../contexts/quotationRequest/domain/quotation-request.repository';

@Injectable({
    providedIn: 'root'
})
export class QuotationRequestService implements QuotationRequestRepository {
    private mockRequests: QuotationRequest[] = [
        new QuotationRequest('1', 'Suministro de Papelería 2024', 'Requerimiento de papelería para el primer semestre.', 'published', new Date('2024-01-15'), new Date('2024-06-30'), 'br1'),
        new QuotationRequest('2', 'Mantenimiento de Aire Acondicionado', 'Servicio preventivo para 5 unidades.', 'published', new Date('2024-02-10'), new Date('2024-03-31'), 'br2'),
        new QuotationRequest('3', 'Compra de Equipos de Computo', '3 Laptops de alta gama para desarrollo.', 'draft', new Date('2024-02-20'), new Date('2024-04-15'), 'br1'),
        new QuotationRequest('4', 'Servicio de Limpieza Oficina Main', 'Servicio mensual durante un año.', 'published', new Date('2024-02-25'), new Date('2025-02-25'), 'br3'),
        new QuotationRequest('5', 'Renovación de Licencias Software', 'Licencias de Adobe y Microsoft Office.', 'published', new Date('2024-03-01'), new Date('2024-05-30'), 'br1'),
        new QuotationRequest('6', 'Adquisición de Inoviliario', '10 sillas ergonómicas y 2 mesas.', 'published', new Date('2024-03-05'), new Date('2024-04-30'), 'br2'),
        new QuotationRequest('7', 'Catering Evento Aniversario', 'Presupuesto para 50 personas.', 'draft', new Date('2024-03-10'), new Date('2024-03-25'), 'br1'),
    ];

    findAll(): Observable<QuotationRequest[]> {
        return of(this.mockRequests).pipe(delay(800));
    }

    findById(id: string): Observable<QuotationRequest | undefined> {
        const request = this.mockRequests.find(r => r.id === id);
        return of(request).pipe(delay(500));
    }

    findLatestPublished(limit: number = 5): Observable<QuotationRequest[]> {
        return of(this.mockRequests)
            .pipe(
                delay(600),
                map(requests => requests
                    .filter(r => r.status === 'published')
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .slice(0, limit)
                )
            );
    }

    findDrafts(): Observable<QuotationRequest[]> {
        return of(this.mockRequests)
            .pipe(
                delay(600),
                map(requests => requests.filter(r => r.status === 'draft'))
            );
    }

    save(request: QuotationRequest): Observable<QuotationRequest> {
        const newRequest = {
            ...request,
            id: (this.mockRequests.length + 1).toString(),
            createdAt: new Date(),
            status: request.status || 'draft'
        };
        this.mockRequests.push(newRequest as QuotationRequest);
        return of(newRequest as QuotationRequest).pipe(delay(1000));
    }

    update(id: string, updatedRequest: QuotationRequest): Observable<QuotationRequest> {
        const index = this.mockRequests.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockRequests[index] = { ...updatedRequest, id };
            return of(this.mockRequests[index]).pipe(delay(1000));
        }
        throw new Error('Request not found');
    }

    delete(id: string): Observable<boolean> {
        const lengthBefore = this.mockRequests.length;
        this.mockRequests = this.mockRequests.filter(r => r.id !== id);
        return of(this.mockRequests.length < lengthBefore).pipe(delay(800));
    }

    duplicate(id: string): Observable<QuotationRequest> {
        const original = this.mockRequests.find(r => r.id === id);
        if (original) {
            const nextId = (this.mockRequests.length + 1).toString();
            const copy = new QuotationRequest(
                nextId,
                `${original.title} (Copia)`,
                original.description,
                'draft', // Duplicates start as drafts
                new Date(),
                original.expirationDate,
                original.branchId,
                [...original.items]
            );
            this.mockRequests.push(copy);
            return of(copy).pipe(delay(1000));
        }
        throw new Error('Original not found');
    }
}
