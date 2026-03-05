export type QuotationStatus = 'published' | 'draft' | 'closed' | 'accepted' | 'rejected';

export interface QuotationItem {
    id: string;
    name: string;
    quantity: number;
    description?: string;
}

export class QuotationRequest {
    constructor(
        public id: string,             // codigo
        public title: string,
        public description: string,
        public status: QuotationStatus, // estado solicitud
        public createdAt: Date,        // fecha de creación
        public expirationDate: Date,   // fecha expiración
        public branchId: string,       // sede (clave foranea)
        public items: QuotationItem[] = [] // productos
    ) { }
}
