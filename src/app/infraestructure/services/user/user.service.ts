import {
  LoginCredentials,
  LoginResponse,
  UserRepository,
} from '../../../contexts/user/domain/user.repository';
import { User, MOCK_USERS } from '../../../contexts/user/domain/models/user.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService implements UserRepository {
  private url = environment.apiUrl;
  private readonly TOKEN_KEY = 'authToken';

  // Temporal state to simulate DB modifications
  private users: User[] = [...MOCK_USERS];

  constructor(private http: HttpClient) { }
  save(user: User): Observable<LoginResponse> {
    // return this.http.post<LoginResponse>(`${this.url}/users/register`, user);

    // Simulated Backend Response
    const response: LoginResponse = {
      token: 'simulated-jwt-' + Math.random().toString(36).substring(7),
      user: user
    };
    return of(response).pipe(delay(1000));
  }

  create(user: User): Observable<User> {
    // --- Future Backend Implementation ---
    // return this.http.post<User>(`${this.url}/users`, user);

    // Simulated Backend Response (creating a user from dashboard)
    const newUser = new User(
      user.identification,
      user.name,
      user.lastName,
      user.email,
      user.password,
      user.city,
      `u${Date.now()}`
    );
    this.users.push(newUser);
    return of(newUser).pipe(delay(800));
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    // return this.http.post<LoginResponse>(`${this.url}/users/login`, credentials);

    // Simulated Backend Response
    const user = this.users.find(u => u.email === credentials.email) || this.users[0];
    const response: LoginResponse = {
      token: 'simulated-jwt-' + Math.random().toString(36).substring(7),
      user: user
    };
    return of(response).pipe(delay(1000));
  }

  findAll(): Observable<User[]> {
    // --- Future Backend Implementation ---
    // return this.http.get<User[]>(`${this.url}/users`);

    // Simulated Backend Response
    return of([...this.users]).pipe(delay(500));
  }

  findById(id: string): Observable<User> {
    // --- Future Backend Implementation ---
    // return this.http.get<User>(`${this.url}/users/${id}`);

    // Simulated Backend Response
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return of({ ...user } as User).pipe(delay(300));
  }

  update(id: string, updatedUser: User): Observable<User> {
    // --- Future Backend Implementation ---
    // return this.http.put<User>(`${this.url}/users/${id}`, updatedUser);

    // Simulated Backend Response
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    updatedUser.id = id;
    this.users[index] = updatedUser;
    return of(updatedUser).pipe(delay(800));
  }

  delete(id: string): Observable<void> {
    // --- Future Backend Implementation ---
    // return this.http.delete<void>(`${this.url}/users/${id}`);

    // Simulated Backend Response
    this.users = this.users.filter(u => u.id !== id);
    return of(undefined).pipe(delay(500));
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

    // return this.http.get<any>(`${this.url}/users/user/session`, {
    //   headers: {
    //     Authorization: 'Bearer ' + token,
    //   },
    // });

    // Simulated Backend Response
    return of({
      user: {
        id: 'simulated-user-123',
        name: 'Usuario',
        lastName: 'Prueba',
        email: 'prueba@cotionline.co'
      }
    }).pipe(delay(500));

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
