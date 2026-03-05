import { Observable } from 'rxjs';
import { QuotationRequest } from './models/quotation-request.model';

export interface QuotationRequestRepository {
    findAll(): Observable<QuotationRequest[]>;
    findById(id: string): Observable<QuotationRequest | undefined>;
    findLatestPublished(limit: number): Observable<QuotationRequest[]>;
    findDrafts(): Observable<QuotationRequest[]>;
    save(request: QuotationRequest): Observable<QuotationRequest>;
    update(id: string, request: QuotationRequest): Observable<QuotationRequest>;
    delete(id: string): Observable<boolean>;
    duplicate(id: string): Observable<QuotationRequest>;
}
