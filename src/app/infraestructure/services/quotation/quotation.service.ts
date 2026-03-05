import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Quotation, QuotationStatus } from '../../../contexts/quotation/domain/models/quotation.model';
import { QuotationRequestService } from '../quotation-request/quotation-request.service';
import { QuotationRequest } from '../../../contexts/quotationRequest/domain/models/quotation-request.model';

@Injectable({
    providedIn: 'root'
})
export class QuotationService {
    private quotations: Quotation[] = [
        // Mock Sent Proposals
        {
            id: 'q1',
            requestId: '1',
            requestTitle: 'Papelería Mes de Marzo',
            fromBusinessId: 'current-biz',
            toBusinessId: 'other-biz',
            status: 'sent',
            emissionDate: new Date(),
            expirationDate: new Date(Date.now() + 86400000 * 7),
            description: 'Ofrecemos los mejores precios en papel bond.',
            individualValues: [
                { productId: 'p1', productName: 'Papel Bond', individualValue: 150000 }
            ],
            totalValue: 150000,
            deliveryTime: '2 días hábiles',
            createdAt: new Date()
        },
        // Mock Received Proposals (someone responded to my request #1)
        {
            id: 'q2',
            requestId: '1',
            requestTitle: 'Papelería Mes de Marzo',
            fromBusinessId: 'other-biz',
            toBusinessId: 'current-biz',
            status: 'pending',
            emissionDate: new Date(),
            expirationDate: new Date(Date.now() + 86400000 * 5),
            description: 'Propuesta para papelería premium.',
            individualValues: [
                { productId: 'p1', productName: 'Papel Bond', individualValue: 165000 }
            ],
            totalValue: 165000,
            deliveryTime: '3 días hábiles',
            createdAt: new Date()
        },
        {
            id: 'q3',
            requestId: '1',
            requestTitle: 'Papelería Mes de Marzo',
            fromBusinessId: 'third-biz',
            toBusinessId: 'current-biz',
            status: 'pending',
            emissionDate: new Date(),
            expirationDate: new Date(Date.now() + 86400000 * 4),
            description: 'Entrega inmediata en todo el lote.',
            individualValues: [
                { productId: 'p1', productName: 'Papel Bond', individualValue: 180000 }
            ],
            totalValue: 180000,
            deliveryTime: '1 día hábil',
            createdAt: new Date()
        }
    ];

    constructor(private quotationRequestService: QuotationRequestService) { }

    getSentQuotations(): Observable<Quotation[]> {
        return of(this.quotations.filter(q => q.fromBusinessId === 'current-biz' && q.status === 'sent')).pipe(delay(500));
    }

    getDraftQuotations(): Observable<Quotation[]> {
        return of(this.quotations.filter(q => q.fromBusinessId === 'current-biz' && q.status === 'draft')).pipe(delay(500));
    }

    getQuotationById(id: string): Observable<Quotation | undefined> {
        return of(this.quotations.find(q => q.id === id)).pipe(delay(400));
    }

    getReceivedQuotations(): Observable<Quotation[]> {
        return of(this.quotations.filter(q => q.toBusinessId === 'current-biz')).pipe(delay(500));
    }

    getReceivedQuotationsByRequestId(requestId: string): Observable<Quotation[]> {
        return of(this.quotations.filter(q => q.toBusinessId === 'current-biz' && q.requestId === requestId)).pipe(delay(500));
    }

    getIncomingRequests(): Observable<QuotationRequest[]> {
        // Return requests that are NOT owned by me (simulated)
        return this.quotationRequestService.findAll().pipe(
            map(requests => requests.filter(r => r.status === 'published' && r.id !== '1' && r.id !== '2'))
        );
    }

    notifyProvider(quotationId: string): Observable<void> {
        // Mock notification to provider
        return of(undefined).pipe(delay(500));
    }

    saveResponse(quotation: Partial<Quotation>): Observable<Quotation> {
        const isUpdate = quotation.id && this.quotations.find(q => q.id === quotation.id);

        if (isUpdate) {
            const index = this.quotations.findIndex(q => q.id === quotation.id);
            this.quotations[index] = { ...this.quotations[index], ...quotation } as Quotation;
            return of(this.quotations[index]).pipe(delay(800));
        }

        const newQuotation: Quotation = {
            id: `q${Date.now()}`,
            status: quotation.status || 'sent',
            createdAt: new Date(),
            ...quotation
        } as Quotation;
        this.quotations.push(newQuotation);
        return of(newQuotation).pipe(delay(800));
    }

    updateStatus(id: string, status: QuotationStatus): Observable<void> {
        const q = this.quotations.find(item => item.id === id);
        if (q) q.status = status;
        return of(undefined).pipe(delay(300));
    }
}
