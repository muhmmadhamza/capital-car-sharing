export type CarBodyType = "sedan" | "suv" | "hatch" | "coupe";

export type Transmission = "Automatic" | "Manual";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";

export interface Car {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  bodyType: CarBodyType;
  /** Display label for the category, e.g. "Compact sedan". */
  category: string;
  seats: number;
  transmission: Transmission;
  fuel: FuelType;
  pricePerDay: number;
  /** Paint colour used by the placeholder illustration until real photos exist. */
  paint: string;
}
