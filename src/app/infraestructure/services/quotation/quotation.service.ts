import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Quotation,
  QuotationStatus,
} from '../../../contexts/quotation/domain/models/quotation.model';
import { QuotationRequestService } from '../quotation-request/quotation-request.service';
import { QuotationRequest } from '../../../contexts/quotationRequest/domain/models/quotation-request.model';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private readonly apiUrl = `${environment.apiUrl}/quotations`;

  constructor(
    private http: HttpClient,
    private quotationRequestService: QuotationRequestService,
  ) {}

  // --- MÉTODOS DE FILTRADO PARA DASHBOARD ---

  /**
   * Obtiene todas las cotizaciones base para filtrar.
   * Ahora consume el nuevo endpoint /my-history creado en el backend.
   */
  private getAllQuotations(): Observable<Quotation[]> {
    return this.http.get<any>(`${this.apiUrl}/my-history`).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data) ? data.map((item: any) => this.mapToFront(item)) : [];
      }),
    );
  }

  getSentQuotations(): Observable<Quotation[]> {
    return this.getAllQuotations().pipe(
      map((list) => {
        const validSentStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'QUOTED', 'CLOSED', 'EXPIRED'];
        return list.filter((q) => validSentStatuses.includes(q.status));
      }),
    );
  }

  getDraftQuotations(): Observable<Quotation[]> {
    return this.getAllQuotations().pipe(
      map((list) => list.filter((q) => q.status === 'DRAFT')),
    );
  }

  /**
   * Obtiene las cotizaciones recibidas para las solicitudes del usuario actual.
   */
  getReceivedQuotations(): Observable<Quotation[]> {
    return this.http.get<any>(`${this.apiUrl}/received`).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data) ? data.map((item: any) => this.mapToFront(item)) : [];
      }),
    );
  }

  getIncomingRequests(filters?: {
    department?: string;
    city?: string;
  }): Observable<QuotationRequest[]> {
    return forkJoin({
      requests: this.quotationRequestService.getPublic(filters).pipe(
        catchError(err => {
          console.error('[QuotationService] Error in getPublic:', err);
          return of([]);
        })
      ),
      myQuotations: this.getAllQuotations().pipe(
        catchError(err => {
          console.error('[QuotationService] Error in getAllQuotations:', err);
          return of([]);
        })
      ),
    }).pipe(
      map(({ requests, myQuotations }: { requests: QuotationRequest[], myQuotations: Quotation[] }) => {
        // Obtenemos los IDs de las solicitudes a las que ya aplicamos (Draft o Enviadas)
        const myQuotedRequestIds = new Set(
          myQuotations.map((q: Quotation) => q.quotationRequestId).filter(id => !!id)
        );

        return requests.filter((r: QuotationRequest) => 
          (r.status === 'PENDING' || r.status === 'QUOTED') && 
          r.id && !myQuotedRequestIds.has(r.id)
        );
      })
    );
  }

  // --- MÉTODOS DE ACCIÓN ---

  getReceivedQuotationsByRequestId(requestId: string): Observable<Quotation[]> {
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/request/${requestId}`)
      .pipe(map((res) => res.data.map((item) => this.mapToFront(item))));
  }

  getQuotationById(id: string): Observable<Quotation> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => this.mapToFront(res.data || res)));
  }

  compare(quotationRequestId: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/compare/${quotationRequestId}`)
      .pipe(map((res) => res.data || res));
  }

  updateStatus(id: string, status: QuotationStatus): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }

  saveResponse(quotation: Partial<Quotation>): Observable<Quotation> {
    const backendData = this.mapToBack(quotation);
    const requestId = quotation.quotationRequestId;

    if (quotation.id) {
      return this.http
        .patch<any>(`${this.apiUrl}/${quotation.id}`, backendData)
        .pipe(map((res) => this.mapToFront(res.data || res)));
    } else {
      return this.http
        .post<any>(`${this.apiUrl}/request/${requestId}`, backendData)
        .pipe(map((res) => this.mapToFront(res.data || res)));
    }
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- MAPPERS ---

  private mapToFront(data: any): Quotation {
    if (!data) return null as any;
    return {
      id: data.id || data._id || '',
      quotationRequestId: data.quotationRequestId || '',
      userId: data.userId || '',
      issueDate: this.safeParseDate(data.issueDate),
      responseDeadline: this.safeParseDate(data.responseDeadline),
      price: data.price || 0,
      deliveryTime: this.safeParseDate(data.deliveryTime),
      description: data.description || '',
      status: (data.status as QuotationStatus) || 'PENDING',
      businessName: data.businessName, // Might be undefined, handled in component
      // UI Helpers
      requestTitle: data.requestTitle || 'Solicitud de Cotización',
      createdAt: this.safeParseDate(data.issueDate),
      individualValues: data.individualValues || [], // Breakdown
    };
  }

  private safeParseDate(date: any): Date {
    if (!date) return new Date();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private mapToBack(q: Partial<Quotation>): any {
    return {
      price: q.price,
      responseDeadline: q.responseDeadline,
      deliveryTime: q.deliveryTime,
      description: q.description,
      status: q.status, // Ya viene en mayúsculas por el tipo y validaciones de UI
      individualValues: q.individualValues, // BREAKDOWN
    };
  }
}
