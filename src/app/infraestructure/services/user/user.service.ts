import {
  LoginCredentials,
  LoginResponse,
  UserRepository,
} from '../../../contexts/user/domain/user.repository';
import { User } from '../../../contexts/user/domain/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService implements UserRepository {
  private url = environment.apiUrl;
  private readonly TOKEN_KEY = 'authToken';

  constructor(private http: HttpClient) {}
  save(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/users/register`, user);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.url}/users/login`, credentials);
  }

  saveToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  decodeToken(token: string): any | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        throw new Error('Formato de token inválido.');
      }

      const payloadBase64 = parts[1];
      const base64Standard = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64Standard);

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.log('Error al decodificar el token', error);
      return null;
    }
  }

  getUserId(): Observable<any> | null {
    const token = this.getToken();
    console.log('ESTE ES EL TOKEN RECUPERADO', token);
    if (!token) {
      return null;
    }

    return this.http.get<any>(`${this.url}/users/user/session`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    // const payload = this.decodeToken(token);
    // const userId = payload?.id || payload?.userId || payload?.sub;

    // if (userId) {
    //   return String(userId);
    // }

    // if (payload) {
    //   console.error(
    //     'Token decodificado, pero no se encontró un ID válido (id, userId o sub). Payload:',
    //     payload
    //   );
    // }
  }
}
