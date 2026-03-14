import { Observable } from 'rxjs';
import { QuotationRequest } from './models/quotation-request.model';

export interface QuotationRequestRepository {
  getMyHistory(): Observable<QuotationRequest[]>;
  findById(id: string): Observable<QuotationRequest>;
  getPublic(): Observable<QuotationRequest[]>;

  // CAMBIO: De Observable<void> a Observable<QuotationRequest>
  save(request: Partial<QuotationRequest>): Observable<QuotationRequest>;

  // CAMBIO: De Observable<void> a Observable<QuotationRequest>
  update(id: string, request: Partial<QuotationRequest>): Observable<QuotationRequest>;

  delete(id: string): Observable<void>;
  search(title: string): Observable<QuotationRequest[]>;
  duplicate(id: string): Observable<QuotationRequest>;
}
