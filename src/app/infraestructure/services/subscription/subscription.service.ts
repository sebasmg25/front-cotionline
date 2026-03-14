import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Plan } from './plan.model';

export interface PaymentInitializationResponse {
  reference: string;
  amountInCents: number;
  currency: string;
  signature: string;
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) {}

  /**
   * Initializes a payment for the specified plan ID via the backend.
   * This generates the transaction reference and the integrity signature required by Wompi.
   */
  initializePayment(planId: string): Observable<PaymentInitializationResponse> {
    return this.http.post<{ message: string, data: PaymentInitializationResponse }>(`${this.apiUrl}/initialize-payment`, { planId }).pipe(
      map(response => response.data)
    );
  }

  /**
   * Fetches all available subscription plans.
   */
  getPlans(): Observable<Plan[]> {
    return this.http.get<{ message: string, data: Plan[] }>(`${environment.apiUrl}/subscriptions/plans`).pipe(
      map(response => response.data)
    );
  }
}
