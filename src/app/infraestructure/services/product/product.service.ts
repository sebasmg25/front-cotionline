import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProductRepository } from '../../../contexts/product/domain/product.repository';
import { Product } from '../../../contexts/product/domain/models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService implements ProductRepository {
    private url = environment.apiUrl;

    // Temporal state to simulate DB modifications
    private products: Product[] = [];

    constructor(private http: HttpClient) { }

    findAll(): Observable<Product[]> {
        // --- Future Backend Implementation ---
        // return this.http.get<Product[]>(`${this.url}/products`);

        // Simulated Backend Response
        return of([...this.products]).pipe(delay(500));
    }

    findById(id: string): Observable<Product> {
        // --- Future Backend Implementation ---
        // return this.http.get<Product>(`${this.url}/products/${id}`);

        // Simulated Backend Response
        const product = this.products.find(p => p.id === id);
        if (!product) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return of({ ...product }).pipe(delay(300));
    }

    save(product: Product): Observable<Product> {
        // --- Future Backend Implementation ---
        // return this.http.post<Product>(`${this.url}/products`, product);

        // Simulated Backend Response
        const newProduct = { ...product, id: `p${Date.now()}` };
        this.products.push(newProduct);
        return of(newProduct).pipe(delay(800));
    }

    update(id: string, product: Product): Observable<Product> {
        // --- Future Backend Implementation ---
        // return this.http.put<Product>(`${this.url}/products/${id}`, product);

        // Simulated Backend Response
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`Product with ID ${id} not found`);
        }
        const updatedProduct = { ...product, id };
        this.products[index] = updatedProduct;
        return of(updatedProduct).pipe(delay(800));
    }

    delete(id: string): Observable<void> {
        // --- Future Backend Implementation ---
        // return this.http.delete<void>(`${this.url}/products/${id}`);

        // Simulated Backend Response
        this.products = this.products.filter(p => p.id !== id);
        return of(undefined).pipe(delay(500));
    }
}
