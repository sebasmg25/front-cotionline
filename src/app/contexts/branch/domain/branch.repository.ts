import { Observable } from 'rxjs';
import { Branch } from './models/branch.model';

export interface BranchRepository {
  findAll(): Observable<Branch[]>;
  findAllByBusiness(businessId: string): Observable<Branch[]>; // Agregado
  findById(id: string): Observable<Branch>;
  save(branch: Branch): Observable<Branch>;
  update(id: string, branch: Partial<Branch>): Observable<Branch>; // Cambiado a Partial
  delete(id: string): Observable<void>;
}
