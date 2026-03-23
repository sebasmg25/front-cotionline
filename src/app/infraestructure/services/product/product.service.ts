import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductRepository } from '../../../contexts/product/domain/product.repository';
import { Product } from '../../../contexts/product/domain/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService implements ProductRepository {
  private readonly endpoint = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  findAllByQuotationRequest(quotationRequestId: string): Observable<Product[]> {
    return this.http
      .get<any>(`${this.endpoint}/quotation-request/${quotationRequestId}`)
      .pipe(map((response) => response.data || response));
  }

  findById(id: string): Observable<Product> {
    return this.http
      .get<any>(`${this.endpoint}/${id}`)
      .pipe(map((response) => response.data || response));
  }

  save(product: Product): Observable<Product> {
    if (!product.quotationRequestId) {
      throw new Error('No se puede guardar un producto sin un quotationRequestId');
    }
    return this.http
      .post<any>(`${this.endpoint}/quotation-request/${product.quotationRequestId}`, product)
      .pipe(map((response) => response.data || response));
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http
      .patch<any>(`${this.endpoint}/${id}`, product)
      .pipe(map((response) => response.data || response));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
