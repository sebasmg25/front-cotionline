export class Product {
  public id?: string;
  public name: string;
  public description: string;
  public amount: number;
  public unitOfMeasurement: string;
  public quotationRequestId?: string;

  constructor(
    name: string,
    description: string,
    unitOfMeasurement: string,
    amount: number,
    id?: string,
    quotationRequestId?: string,
  ) {
    this.name = name;
    this.description = description;
    this.unitOfMeasurement = unitOfMeasurement;
    this.amount = amount;
    this.id = id;
    this.quotationRequestId = quotationRequestId;
  }
}
