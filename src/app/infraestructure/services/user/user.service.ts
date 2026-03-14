import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../contexts/user/domain/models/user.model';
import { ApiResponse, LoginResponse } from '../../../contexts/user/domain/user.repository';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el perfil del usuario logueado.
   * El Interceptor añade el token automáticamente.
   */
  getProfile(): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.url}/profile`).pipe(map((res) => res.data));
  }

  /**
   * Actualiza los datos del perfil.
   * Corresponde a la ruta PATCH /profile/update
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.url}/profile/update`, userData)
      .pipe(map((res) => res.data));
  }

  /**
   * Elimina la cuenta del usuario.
   * Corresponde a la ruta DELETE /profile/delete
   */
  deleteAccount(): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.url}/profile/delete`)
      .pipe(map(() => undefined));
  }

  /**
   * Métodos CRUD para administración/registro
   */
  save(user: User): Observable<LoginResponse> {
    return this.http.post<ApiResponse<LoginResponse>>(this.url, user).pipe(map(res => res.data));
  }
}
