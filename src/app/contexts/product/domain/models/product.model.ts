export class Product {
    public id?: string;
    public name: string;
    public description: string;
    public measure_unit: string;
    public stock: number;

    constructor(
        name: string,
        description: string,
        measure_unit: string,
        stock: number,
        id?: string
    ) {
        this.name = name;
        this.description = description;
        this.measure_unit = measure_unit;
        this.stock = stock;
        this.id = id;
    }
}

