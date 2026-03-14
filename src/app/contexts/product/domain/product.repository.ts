import { Observable } from 'rxjs';
import { Product } from './models/product.model';

export interface ProductRepository {
  // Basado en findProductsByQuotationRequestId del Back
  findAllByQuotationRequest(quotationRequestId: string): Observable<Product[]>;

  // Basado en findById del Back
  findById(id: string): Observable<Product>;

  // Basado en save del Back
  save(product: Product): Observable<Product>;

  // Basado en update del Back
  update(id: string, product: Partial<Product>): Observable<Product>;

  // Basado en delete del Back
  delete(id: string): Observable<void>;
}
