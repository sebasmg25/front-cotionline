import { Business, MOCK_BUSINESSES } from '../../../contexts/business/domain/models/business.model';
import { BusinessRepository } from '../../../contexts/business/domain/business.repository';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BusinessService implements BusinessRepository {
  private url = environment.apiUrl;

  // Temporal state to simulate DB modifications
  private businesses: Business[] = [...MOCK_BUSINESSES];

  constructor(private http: HttpClient) { }

  save(business: Business): Observable<Business> {
    // --- Future Backend Implementation ---
    // return this.http.post<Business>(`${this.url}/businesses/register`, business);

    // Simulated Backend Response
    const newBusiness = new Business(
      business.nit,
      business.name,
      business.description,
      business.address,
      business.userId,
      `b${Date.now()}`
    );
    this.businesses.push(newBusiness);
    return of(newBusiness).pipe(delay(800));
  }

  getBusinessId(businessId: string): Observable<Business> {
    return this.findById(businessId);
  }

  findAll(): Observable<Business[]> {
    // --- Future Backend Implementation ---
    // return this.http.get<Business[]>(`${this.url}/businesses`);

    // Simulated Backend Response
    return of([...this.businesses]).pipe(delay(500));
  }

  findById(id: string): Observable<Business> {
    // --- Future Backend Implementation ---
    // return this.http.get<Business>(`${this.url}/businesses/${id}`);

    // Simulated Backend Response
    const business = this.businesses.find(b => b.id === id);
    if (!business) {
      throw new Error(`Business with ID ${id} not found`);
    }
    return of({ ...business } as Business).pipe(delay(300));
  }

  update(id: string, updatedBusiness: Business): Observable<Business> {
    // --- Future Backend Implementation ---
    // return this.http.put<Business>(`${this.url}/businesses/${id}`, updatedBusiness);

    // Simulated Backend Response
    const index = this.businesses.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Business with ID ${id} not found`);
    }
    updatedBusiness.id = id;
    this.businesses[index] = updatedBusiness;
    return of(updatedBusiness).pipe(delay(800));
  }

  delete(id: string): Observable<void> {
    // --- Future Backend Implementation ---
    // return this.http.delete<void>(`${this.url}/businesses/${id}`);

    // Simulated Backend Response
    this.businesses = this.businesses.filter(b => b.id !== id);
    return of(undefined).pipe(delay(500));
  }
}
