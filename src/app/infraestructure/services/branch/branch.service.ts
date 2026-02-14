import { Branch } from '../../../contexts/branch/domain/models/branch.model';
import { BranchRepository } from '../../../contexts/branch/domain/branch.repository';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BranchService implements BranchRepository {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  save(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(`${this.url}/branches/register`, branch);
  }
}
