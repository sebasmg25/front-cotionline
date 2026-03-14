export type QuotationStatus =
  | 'PENDING'
  | 'QUOTED'
  | 'EXPIRED'
  | 'CLOSED'
  | 'DRAFT'; // Nuevo: El usuario está editando, nadie más la ve.

export interface QuotationItem {
  id?: string;
  name: string;
  quantity: number;
  description?: string;
  unitOfMeasurement: string;
  refIndex?: number; // Identificador persistente para la UI
}

export class QuotationRequest {
  constructor(
    public id: string | undefined,
    public title: string,
    public description: string,
    public status: QuotationStatus,
    public createdAt: Date,
    public responseDeadline: Date,
    public branch: string,
    public userId?: string,
    public items: QuotationItem[] = [],
    public branchName?: string,
  ) {}
}
