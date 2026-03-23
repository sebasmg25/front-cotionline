import { Observable } from 'rxjs';
import { Product } from './models/product.model';

export interface ProductRepository {
  findAllByQuotationRequest(quotationRequestId: string): Observable<Product[]>;

  findById(id: string): Observable<Product>;

  save(product: Product): Observable<Product>;

  update(id: string, product: Partial<Product>): Observable<Product>;

  delete(id: string): Observable<void>;
}
