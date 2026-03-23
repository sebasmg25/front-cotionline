import { Observable } from 'rxjs';
import { Branch } from './models/branch.model';

export interface BranchRepository {
  findAll(): Observable<Branch[]>;
  findAllByBusiness(businessId: string): Observable<Branch[]>;
  findById(id: string): Observable<Branch>;
  save(branch: Branch): Observable<Branch>;
  update(id: string, branch: Partial<Branch>): Observable<Branch>;
  delete(id: string): Observable<void>;
}
