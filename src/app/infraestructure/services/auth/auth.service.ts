import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  LoginCredentials,
  LoginResponse,
  ApiResponse,
} from '../../../contexts/user/domain/user.repository';
import { User } from '../../../contexts/user/domain/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private url = environment.apiUrl;
  private readonly TOKEN_KEY = 'authToken';

  constructor(private http: HttpClient) {}

  register(user: User): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.url}/users/register`, user)
      .pipe(map((res) => res.data));
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.url}/users/login`, credentials)
      .pipe(map((res) => res.data));
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.url}/users/forgot-password`, { email });
  }

  resetPassword(data: { userId: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.url}/users/reset-password`, data);
  }

  getUserSession(): Observable<LoginResponse> {
    if (!this.isLoggedIn()) {
    }
    return this.http
      .get<ApiResponse<LoginResponse>>(`${this.url}/users/session`)
      .pipe(map((res) => res.data));
  }

  // --- GESTIÓN DE TOKEN (LOCAL STORAGE) ---

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isCollaborator(user: User | null | undefined): boolean {
    if (!user) return false;
    return (user.role as any) === 'COLLABORATOR';
  }

  getEffectiveOwnerId(user: User | null | undefined): string | undefined {
    if (!user) return undefined;
    return user.ownerId || user.id;
  }
}
