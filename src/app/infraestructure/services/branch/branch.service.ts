import { Branch, MOCK_BRANCHES } from '../../../contexts/branch/domain/models/branch.model';
import { BranchRepository } from '../../../contexts/branch/domain/branch.repository';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BranchService implements BranchRepository {
  private url = environment.apiUrl;

  // Temporal state to simulate DB modifications
  private branches: Branch[] = [...MOCK_BRANCHES];

  constructor(private http: HttpClient) { }

  save(branch: Branch): Observable<Branch> {
    // --- Future Backend Implementation ---
    // return this.http.post<Branch>(`${this.url}/branches/register`, branch);

    // Simulated Backend Response
    const newBranch = new Branch(
      branch.name,
      branch.address,
      branch.city,
      branch.businessId,
      `br${Date.now()}`
    );
    this.branches.push(newBranch);
    return of(newBranch).pipe(delay(800));
  }

  findAll(): Observable<Branch[]> {
    // --- Future Backend Implementation ---
    // return this.http.get<Branch[]>(`${this.url}/branches`);

    // Simulated Backend Response
    return of([...this.branches]).pipe(delay(500));
  }

  findById(id: string): Observable<Branch> {
    // --- Future Backend Implementation ---
    // return this.http.get<Branch>(`${this.url}/branches/${id}`);

    // Simulated Backend Response
    const branch = this.branches.find(b => b.id === id);
    if (!branch) {
      throw new Error(`Branch with ID ${id} not found`);
    }
    return of({ ...branch } as Branch).pipe(delay(300));
  }

  update(id: string, updatedBranch: Branch): Observable<Branch> {
    // --- Future Backend Implementation ---
    // return this.http.put<Branch>(`${this.url}/branches/${id}`, updatedBranch);

    // Simulated Backend Response
    const index = this.branches.findIndex(b => b.id === id);
    if (index === -1) {
      throw new Error(`Branch with ID ${id} not found`);
    }
    updatedBranch.id = id;
    this.branches[index] = updatedBranch;
    return of(updatedBranch).pipe(delay(800));
  }

  delete(id: string): Observable<void> {
    // --- Future Backend Implementation ---
    // return this.http.delete<void>(`${this.url}/branches/${id}`);

    // Simulated Backend Response
    this.branches = this.branches.filter(b => b.id !== id);
    return of(undefined).pipe(delay(500));
  }
}
