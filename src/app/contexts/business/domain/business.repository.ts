import { Observable } from 'rxjs';
import { Business } from './models/business.model';

export interface BusinessRepository {
  save(business: Business): Observable<Business>;
}
