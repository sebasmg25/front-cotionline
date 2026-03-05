export class Branch {
  public id?: string;        // codigo
  public name: string;      // nombre
  public address: string;   // dirección
  public city: string;      // ciudad (keep for context)
  public businessId: string; // negocio (clave foranea)

  constructor(name: string, address: string, city: string, businessId: string, id?: string) {
    this.name = name;
    this.address = address;
    this.city = city;
    this.businessId = businessId;
    this.id = id;
  }
}

// Temporary mock data for UI development
export const MOCK_BRANCHES: Branch[] = [
  new Branch(
    'Sucursal Principal Norte',
    'Av. Caracas # 72-14',
    'Bogotá',
    'b1',
    'br1'
  ),
  new Branch(
    'Sede Sur Industrial',
    'Autopista Sur # 45-90',
    'Medellín',
    'b2',
    'br2'
  ),
  new Branch(
    'Punto de Venta Centro',
    'Cra 7 # 12-34',
    'Cali',
    'b3',
    'br3'
  )
];
