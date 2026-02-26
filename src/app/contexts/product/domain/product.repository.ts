import { Observable } from 'rxjs';
import { Product } from './models/product.model';

export interface ProductRepository {
    findAll(): Observable<Product[]>;
    findById(id: string): Observable<Product>;
    save(product: Product): Observable<Product>;
    update(id: string, product: Product): Observable<Product>;
    delete(id: string): Observable<void>;
}
