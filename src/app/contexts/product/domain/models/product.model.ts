export class Product {
  public id?: string;
  public name: string;
  public description: string;
  public amount: number; // Antes: stock
  public unitOfMeasurement: string; // Antes: measure_unit
  public quotationRequestId?: string; // Vinculación con la solicitud

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
