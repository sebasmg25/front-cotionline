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

// Temporary mock data for UI development
export const MOCK_BUSINESSES: Business[] = [
  new Business(
    '800123456-1',
    'Tech Solutions S.A.S',
    'Empresa de desarrollo de software a medida',
    'Calle 100 # 15-20, Bogotá',
    'u1',
    'b1'
  ),
  new Business(
    '900987654-2',
    'Comercializadora El Sol',
    'Distribución de abarrotes al por mayor',
    'Cra 50 # 30-10, Medellín',
    'u2',
    'b2'
  ),
  new Business(
    '101010101-3',
    'Transportes Rápidos',
    'Servicios de logística y envíos',
    'Avenida Principal 45, Cali',
    'u3',
    'b3'
  )
];
