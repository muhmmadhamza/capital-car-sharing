import type { CarBodyType, FuelType, Transmission } from "./car";
import type { RentalWindow } from "./booking";

/** Attribute filters. In the API these become SQL WHERE clauses. */
export interface CarFilters {
  bodyTypes: CarBodyType[];
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
  transmission?: Transmission;
  fuels: FuelType[];
}

export type CarSort = "recommended" | "price-asc" | "price-desc";

export interface CarSearchQuery {
  location: string;
  window?: RentalWindow;
  filters: CarFilters;
  sort: CarSort;
  /** Hide cars that are not available for the window. */
  availableOnly: boolean;
}
