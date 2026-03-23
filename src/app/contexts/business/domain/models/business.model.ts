export enum BusinessStatus {
  PENDING = 'PENDIENTE',
  VERIFIED = 'VERIFICADO',
  RECHAZADO = 'RECHAZADO',
}

export class Business {
  constructor(
    public nit: string,
    public name: string,
    public description: string,
    public address: string,
    public userId?: string,
    public status?: BusinessStatus,
    public rutUrl?: string,
    public chamberOfCommerceUrl?: string,
    public id?: string,
  ) {}
}
