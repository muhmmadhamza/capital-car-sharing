import type { AvailabilityResult, BookingBlock, WallClock } from "./booking";

export type CarBodyType = "sedan" | "suv" | "hatch" | "coupe" | "luxury" | "van" | "convertible" | "pickup";

export type Transmission = "Automatic" | "Manual";
export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric" | "CNG";

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
  /** Pickup branch id. */
  locationId: string;
  /** Pickup place as the owner typed it, e.g. "Gulberg, Lahore". */
  locationName: string;
  doors: number;
  /** Large suitcases that fit. Not provided by the API yet, so screens hide it when missing. */
  luggage?: number;
  description: string;
  features: string[];
  images: CarImage[];
  /** Refundable security deposit, in the site currency. Not provided by the API yet. */
  depositAmount?: number;
  /** Kilometres included per day. Not provided by the API yet. */
  mileagePerDay?: number;
}

export interface Location {
  id: string;
  name: string;
  /** Empty when the API only gives one free-text location. */
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
  luxury: "Luxury",
  van: "Van",
  convertible: "Convertible",
  pickup: "Pickup",
};
