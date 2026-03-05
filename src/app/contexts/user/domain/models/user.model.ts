export class User {
  public identification: string;
  public name: string;
  public lastName: string;
  public email: string;
  public password: string;
  public city: string;
  public department: string; // New field
  public id?: string;

  constructor(
    identification: string,
    name: string,
    lastName: string,
    email: string,
    password: string,
    city: string,
    department: string,
    id?: string
  ) {
    this.identification = identification;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.city = city;
    this.department = department;
    this.id = id;
  }
}

// Temporary mock data for UI development
export const MOCK_USERS: User[] = [
  new User(
    '1010101010',
    'Juan',
    'Pérez',
    'juan.perez@example.com',
    '',
    'Bogotá',
    'Cundinamarca',
    'u1'
  ),
  new User(
    '2020202020',
    'María',
    'Gómez',
    'maria.gomez@example.com',
    '',
    'Medellín',
    'Antioquia',
    'u2'
  ),
  new User(
    '3030303030',
    'Carlos',
    'Ramírez',
    'carlos.ramirez@example.com',
    '',
    'Cali',
    'Valle del Cauca',
    'u3'
  )
];
