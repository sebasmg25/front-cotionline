export class Branch {
  public id?: string;
  public name: string;
  public address: string;
  public city: string;
  public businessId: string;

  constructor(name: string, address: string, city: string, businessId: string, id?: string) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.businessId = businessId;
    this.id = id;
  }
}
