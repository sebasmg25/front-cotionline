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

  requestTitle?: string;
  status: QuotationStatus;
  createdAt?: Date;
  updatedAt?: Date;
  individualValues?: any[];
  businessName?: string;
}
