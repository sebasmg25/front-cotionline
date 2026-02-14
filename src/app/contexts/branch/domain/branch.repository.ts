import { Observable } from 'rxjs';
import { Branch } from './models/branch.model';

export interface BranchRepository {
  save(branch: Branch): Observable<Branch>;
}
