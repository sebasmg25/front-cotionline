// En tu archivo de modelos de Quotation
export type QuotationStatus = 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REJECTED' | 'QUOTED' | 'CLOSED';


export interface Quotation {
  id: string;
  quotationRequestId: string;
  userId: string;
  issueDate: Date;
  responseDeadline: Date;
  price: number;
  deliveryTime: Date;
  description?: string;

  // Frontend helper fields (keeping for now to avoid breaking views)
  requestTitle?: string;
  status: QuotationStatus;
  createdAt?: Date;
  updatedAt?: Date;
  individualValues?: any[];
  businessName?: string;
}
