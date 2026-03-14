import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // IMPORTANTE: Sin esto el map no funciona

// Importamos nuestras interfaces del dominio
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

  /**
   * Registra un nuevo usuario.
   * Usamos map para extraer 'data' y entregar solo LoginResponse al componente.
   */
  register(user: User): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.url}/users/register`, user)
      .pipe(map((res) => res.data));
  }

  /**
   * Autentica al usuario.
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.url}/users/login`, credentials)
      .pipe(map((res) => res.data));
  }

  /**
   * Recupera la sesión actual usando el token guardado.
   * Nota: La URL debe coincidir con tu ruta de Express (users/user/session).
   */
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
    // Aquí podrías añadir una redirección al login
  }

  /**
   * Método útil para saber si el usuario está logueado sin llamar al back
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Helpers para Roles
   */
  isCollaborator(user: User | null | undefined): boolean {
    if (!user) return false;
    // Si tienes un UserRole enum podrías usarlo, sino string literal
    return (user.role as any) === 'COLLABORATOR';
  }

  getEffectiveOwnerId(user: User | null | undefined): string | undefined {
    if (!user) return undefined;
    return user.ownerId || user.id;
  }
}
