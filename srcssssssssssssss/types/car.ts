import type { AvailabilityResult, BookingBlock, WallClock } from "./booking";

export type CarBodyType = "sedan" | "suv" | "hatch" | "coupe";

export type Transmission = "Automatic" | "Manual";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";

export interface CarImage {
  /** Absolute or site-relative URL. Leave empty to show the placeholder illustration. */
  src?: string;
  alt: string;
  label: string;
}

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
  /** Pickup branch. */
  locationId: string;
  doors: number;
  /** Large suitcases that fit. */
  luggage: number;
  description: string;
  features: string[];
  images: CarImage[];
  /** Refundable security deposit, in the site currency. */
  depositAmount: number;
  /** Kilometres included per day. */
  mileagePerDay: number;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  address: string;
}

/** What the listing page renders: a car plus its branch and availability for the search. */
export interface CarListing extends Car {
  location: Location;
  availability: AvailabilityResult;
}

export interface CarDetail extends CarListing {
  /** Every block the calendar needs. The API should only return future blocks. */
  blocks: BookingBlock[];
  /** "Now" in the branch's time zone, so server and browser agree on what is past. */
  now: WallClock;
}

export const BODY_TYPE_LABELS: Record<CarBodyType, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatch: "Hatchback",
  coupe: "Coupe",
};
