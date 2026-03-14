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

  // Obtiene las solicitudes del usuario logueado (Borradores y Publicadas)
  getMyHistory(): Observable<QuotationRequest[]> {
    return this.http.get<any>(`${this.apiUrl}/my-history`).pipe(
      map((res) => {
        const data = res.data || res;
        return Array.isArray(data) ? data.map((item: any) => this.mapToModel(item)) : [];
      }),
    );
  }

  // Obtiene solicitudes de otros para cotizar (Cartelera pública)
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
    console.log('QuotationRequestService: Buscando solicitud por ID:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => this.mapToModel(response.data || response)),
    );
  }

  findPublicById(id: string): Observable<QuotationRequest> {
    console.log('QuotationRequestService: Buscando solicitud PUBLIC por ID:', id);
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

  /**
   * CORREGIDO: Ahora retorna Observable<QuotationRequest> para que el componente
   * obtenga el ID generado inmediatamente.
   */
  save(request: Partial<QuotationRequest>): Observable<QuotationRequest> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, request)
      .pipe(map((response) => this.mapToModel(response.data || response)));
  }

  /**
   * CORREGIDO: También retorna el objeto actualizado.
   */
  update(id: string, request: Partial<QuotationRequest>): Observable<QuotationRequest> {
    return this.http
      .patch<any>(`${this.apiUrl}/${id}`, request)
      .pipe(map((response) => this.mapToModel(response.data || response)));
  }

  /**
   * Cierra una solicitud, seleccionando una oferta ganadora.
   */
  close(id: string, selectedOfferId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/close`, { selectedOfferId });
  }

  duplicate(id: string): Observable<QuotationRequest> {
    // 1. Obtenemos la solicitud original con todos sus datos y productos (ya mapeados por findById)
    return this.findById(id).pipe(
      switchMap((original: QuotationRequest) => {
        // 2. Preparamos la nueva solicitud (limpia)
        const duplicateData: Partial<QuotationRequest> = {
          title: `${original.title} (Copia)`,
          description: original.description,
          branch: original.branch,
          responseDeadline: original.responseDeadline,
          status: 'DRAFT',
        };

        // 3. Guardamos la nueva solicitud (cabecera)
        return this.save(duplicateData).pipe(
          switchMap((saved: QuotationRequest) => {
            if (!original.items || original.items.length === 0) {
              return of(saved);
            }

            // 4. Clonamos cada uno de los productos manualmente
            const productClones$ = original.items.map((item) => {
              const productBody: any = {
                name: item.name,
                description: item.description,
                amount: item.quantity,
                unitOfMeasurement: item.unitOfMeasurement,
                quotationRequestId: saved.id, // Vinculamos al nuevo ID
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

  // Mapper centralizado
  private mapToModel(data: any): QuotationRequest {
    if (!data) return null as any;

    // Si los items vienen del backend como Product[], los mapeamos a QuotationItem[]
    // El backend puede enviar 'items' o 'products' según la implementación
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
