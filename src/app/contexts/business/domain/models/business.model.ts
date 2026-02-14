export class Business {
  public id?: string;
  public nit: string;
  public name: string;
  public description: string;
  public address: string;
  public userId: string;

  constructor(
    nit: string,
    name: string,
    description: string,
    address: string,
    userId: string,
    id?: string
  ) {
    this.nit = nit;
    this.name = name;
    this.description = description;
    this.address = address;
    this.userId = userId;
    this.id = id;
  }
}
