import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Business } from '../../../contexts/business/domain/models/business.model';
import { BusinessRepository } from '../../../contexts/business/domain/business.repository';

@Injectable({
  providedIn: 'root',
})
export class BusinessService implements BusinessRepository {
  private url = `${environment.apiUrl}/businesses`;

  constructor(private http: HttpClient) {}

  /**
   * NUEVO: Obtiene el negocio del usuario logueado.
   * El Backend identificará al usuario por el Token.
   */
  findByUser(): Observable<Business> {
    return this.http
      .get<{ data: Business }>(`${this.url}/my-business`)
      .pipe(map((res) => res.data));
  }

  save(business: any): Observable<Business> {
    return this.http
      .post<{ data: Business }>(`${this.url}/register`, business)
      .pipe(map((res) => res.data));
  }

  update(id: string, updatedBusiness: any): Observable<Business> {
    return this.http
      .patch<{ data: Business }>(`${this.url}/${id}`, updatedBusiness)
      .pipe(map((res) => res.data));
  }

  findById(id: string): Observable<Business> {
    return this.http.get<{ data: Business }>(`${this.url}/${id}`).pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Método administrativo
  verify(id: string, status: string): Observable<Business> {
    return this.http
      .patch<{ data: Business }>(`${this.url}/${id}/verify`, { status })
      .pipe(map((res) => res.data));
  }
}
