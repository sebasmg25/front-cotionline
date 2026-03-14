export enum PlanName {
  FREE = 'GRATUITO',
  BASIC = 'BASICO',
  PREMIUM = 'PREMIUM',
}

export interface Plan {
  id: string;
  name: PlanName;
  price: number;
  requestLimit: number;
  quotationLimit: number;
  collaboratorLimit: number;
}
