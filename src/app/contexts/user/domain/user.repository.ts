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

export interface UserRepository {
  save(user: User): Observable<LoginResponse>;
  login(loginCredentials: LoginCredentials): Observable<LoginResponse>;
}
