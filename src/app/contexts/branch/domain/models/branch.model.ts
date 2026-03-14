export class Branch {
  public id?: string; // codigo
  public name: string; // nombre
  public address: string; // dirección
  public city: string; // ciudad (keep for context)
  public businessId: string; // negocio (clave foranea)

  constructor(name: string, address: string, city: string, businessId: string, id?: string) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.businessId = businessId;
    this.id = id;
  }
}
