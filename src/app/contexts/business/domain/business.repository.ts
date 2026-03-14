import { Observable } from 'rxjs';
import { Business } from './models/business.model';

export interface BusinessRepository {
  findByUser(): Observable<Business>;
  findById(id: string): Observable<Business>;
  save(business: Business): Observable<Business>;
  update(id: string, business: Business): Observable<Business>;
  delete(id: string): Observable<void>;
}
