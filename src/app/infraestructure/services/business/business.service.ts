import { Business } from '../../../contexts/business/domain/models/business.model';
import { BusinessRepository } from '../../../contexts/business/domain/business.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusinessService implements BusinessRepository {
  private url = environment.apiUrl;
  constructor(private http: HttpClient) {}
  save(business: Business): Observable<Business> {
    return this.http.post<Business>(`${this.url}/businesses/register`, business);
  }

  getBusinessId(businessId: string): Observable<Business> {
    return this.http.get<Business>(`${this.url}/businesses/${businessId}`);
  }
}
