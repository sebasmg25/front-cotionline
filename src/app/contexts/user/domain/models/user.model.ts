export enum UserRole {
  OWNER = 'OWNER',
  COLLABORATOR = 'COLLABORATOR',
}

export class User {
  public identification: string;
  public name: string;
  public lastName: string;
  public email: string;
  public password: string;
  public city: string;
  public department: string; // New field
  public id?: string;
  public planId?: string;
  public planStartDate?: Date;
  public role: UserRole = UserRole.OWNER;
  public ownerId?: string;

  constructor(
    identification: string,
    name: string,
    lastName: string,
    email: string,
    password: string,
    city: string,
    department: string,
    id?: string,
    planId?: string,
    planStartDate?: Date,
    role: UserRole = UserRole.OWNER,
    ownerId?: string,
  ) {
    this.identification = identification;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.city = city;
    this.department = department;
    this.id = id;
    this.planId = planId;
    this.planStartDate = planStartDate;
    this.role = role;
    this.ownerId = ownerId;
  }
}
