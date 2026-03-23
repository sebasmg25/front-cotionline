import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { QuotationRequest, QuotationItem } from '../../../contexts/quotationRequest/domain/models/quotation-request.model';
import { QuotationRequestRepository } from '../../../contexts/quotationRequest/domain/quotation-request.repository';
import { ProductService } from '../product/product.service';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuotationRequestService implements QuotationRequestRepository {
  private readonly apiUrl = `${environment.apiUrl}/quotationRequests`;

  constructor(
    private http: HttpClient,
    private productService: ProductService,
  ) {}

  getMyHistory(): Observable<QuotationRequest[]> {
    return this.http.get<any>(`${this.apiUrl}/my-history`).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data) ? data.map((item: any) => this.mapToModel(item)) : [];
      }),
    );
  }

  getPublic(filters?: {
    department?: string;
    city?: string;
  }): Observable<QuotationRequest[]> {
    let params = new HttpParams();
    if (filters?.department) params = params.set('department', filters.department);
    if (filters?.city) params = params.set('city', filters.city);

    return this.http.get<any>(`${this.apiUrl}/public`, { params }).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data)
          ? data.map((item: any) => this.mapToModel(item))
          : [];
      }),
    );
  }

  findById(id: string): Observable<QuotationRequest> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => this.mapToModel(response.data || response)),
    );
  }

  findPublicById(id: string): Observable<QuotationRequest> {
    return this.http.get<any>(`${this.apiUrl}/public/${id}`).pipe(
      map((response) => this.mapToModel(response.data || response)),
    );
  }

  search(title: string): Observable<QuotationRequest[]> {
    const params = new HttpParams().set('title', title);
    return this.http.get<any>(`${this.apiUrl}/search`, { params }).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data) ? data.map((item: any) => this.mapToModel(item)) : [];
      }),
    );
  }

  save(request: Partial<QuotationRequest>): Observable<QuotationRequest> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, request)
      .pipe(map((response) => this.mapToModel(response.data || response)));
  }

  update(id: string, request: Partial<QuotationRequest>): Observable<QuotationRequest> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, request)
      .pipe(map((response) => this.mapToModel(response.data || response)));
  }

  close(id: string, selectedOfferId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/close`, { selectedOfferId });
  }

  duplicate(id: string): Observable<QuotationRequest> {
    return this.findById(id).pipe(
      switchMap((original: QuotationRequest) => {
        const duplicateData: Partial<QuotationRequest> = {
          title: `${original.title} (Copia)`,
          description: original.description,
          branch: original.branch,
          responseDeadline: original.responseDeadline,
          status: 'DRAFT',
        };

        return this.save(duplicateData).pipe(
          switchMap((saved: QuotationRequest) => {
            if (!original.items || original.items.length === 0) {
              return of(saved);
            }

            const productClones$ = original.items.map((item) => {
              const productBody: any = {
                name: item.name,
                description: item.description,
                amount: item.quantity,
                unitOfMeasurement: item.unitOfMeasurement,
                quotationRequestId: saved.id,
              };
              return this.productService.save(productBody);
            });

            return forkJoin(productClones$).pipe(map(() => saved));
          }),
        );
      }),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapToModel(data: any): QuotationRequest {
    if (!data) return null as any;

    const rawItems = data.items || data.products || [];
    let modelItems: QuotationItem[] = [];

    if (Array.isArray(rawItems)) {
      modelItems = rawItems.map((i: any) => ({
        id: i.id || i._id,
        name: i.name,
        quantity: i.amount || i.quantity || 1,
        description: i.description,
        unitOfMeasurement: i.unitOfMeasurement || '',
      }));
    }

    const requestModel = new QuotationRequest(
      data.id || data._id,
      data.title,
      data.description || '',
      data.status,
      new Date(data.createdAt),
      new Date(data.responseDeadline),
      data.branch,
      data.userId,
      modelItems,
      data.branchName,
    );

    return requestModel;
  }
}
