export type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'draft';

export interface QuotationProductValue {
    productId: string;
    productName: string;
    individualValue: number;
}

export interface Quotation {
    id: string;                  // codigo
    requestId: string;           // Reference to the QuotationRequest
    requestTitle: string;        // Cache title for dashboard
    fromBusinessId: string;      // Supplier business
    toBusinessId: string;        // Requester business
    status: QuotationStatus;
    emissionDate: Date;          // fecha emisión (automatica)
    expirationDate: Date;        // fecha expiración
    deliveryTime: string;        // tiempo de entrega
    individualValues: QuotationProductValue[]; // valor individual por producto
    totalValue: number;          // valor total
    description: string;         // descripción u observaciónes
    createdAt: Date;
    updatedAt?: Date;
}
