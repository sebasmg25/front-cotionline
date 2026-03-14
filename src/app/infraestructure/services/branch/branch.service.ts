import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Branch } from '../../../contexts/branch/domain/models/branch.model';
import { BranchRepository } from '../../../contexts/branch/domain/branch.repository';

@Injectable({
  providedIn: 'root',
})
export class BranchService implements BranchRepository {
  private readonly endpoint = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  /**
   * RECORRECIÓN: findAll() ahora llama a la ruta correcta del backend.
   * Si no tienes el businessId global, lo ideal es obtenerlo del perfil del usuario.
   */
  findAll(): Observable<Branch[]> {
    const businessId = localStorage.getItem('businessId');
    if (!businessId) return of([]);

    return this.findAllByBusiness(businessId);
  }

  findAllByBusiness(businessId: string): Observable<Branch[]> {
    return this.http
      .get<{ message: string; data: Branch[] }>(`${this.endpoint}/business/${businessId}`)
      .pipe(map((response) => response.data));
  }

  findById(id: string): Observable<Branch> {
    return this.http
      .get<{ message: string; data: Branch }>(`${this.endpoint}/${id}`)
      .pipe(map((response) => response.data));
  }

  save(branch: Branch): Observable<Branch> {
    return this.http
      .post<{ message: string; data: Branch }>(`${this.endpoint}/register`, branch)
      .pipe(map((response) => response.data));
  }

  update(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http
      .patch<{ message: string; data: Branch }>(`${this.endpoint}/${id}`, branch)
      .pipe(map((response) => response.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
