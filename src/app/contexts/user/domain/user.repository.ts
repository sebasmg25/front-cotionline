import { Observable } from 'rxjs';
import { User } from './models/user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface UserRepository {
  save(user: User): Observable<LoginResponse>;
  create(user: User): Observable<User>;
  login(loginCredentials: LoginCredentials): Observable<LoginResponse>;
  findById(id: string): Observable<User>;
  update(id: string, user: User): Observable<User>;
  delete(id: string): Observable<void>;
}
