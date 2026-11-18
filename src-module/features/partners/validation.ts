import type { PartnerCarInput } from "@/types/partner";
import { MAX_CAR_IMAGES, MIN_CAR_YEAR } from "./catalog";

export function validateAddress(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your address.";
  if (v.length < 6) return "Your address looks too short.";
}

export function validateCompany(value: string): string | undefined {
  if (value.trim().length > 80) return "Keep the company name under 80 characters.";
}

export type CarFormValues = {
  make: string;
  model: string;
  year: string;
  type: string;
  seats: string;
  doors: string;
  transmission: string;
  fuelType: string;
  dailyPrice: string;
  location: string;
  description: string;
};

export type CarFormField = keyof CarFormValues | "images";

const wholeNumber = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : Number.NaN);

/** Instant feedback for the Add/Edit Car forms. The API must validate again. */
export function validateCarForm(values: CarFormValues, imageCount: number): Partial<Record<CarFormField, string>> {
  const errors: Partial<Record<CarFormField, string>> = {};
  if (!values.make.trim()) errors.make = "Enter the make, for example Toyota.";
  if (!values.model.trim()) errors.model = "Enter the model, for example Corolla.";

  const year = wholeNumber(values.year);
  const maxYear = new Date().getFullYear() + 1;
  if (Number.isNaN(year)) errors.year = "Enter the model year.";
  else if (year < MIN_CAR_YEAR || year > maxYear) errors.year = `Enter a year between ${MIN_CAR_YEAR} and ${maxYear}.`;

  const seats = wholeNumber(values.seats);
  if (Number.isNaN(seats) || seats < 1 || seats > 12) errors.seats = "Seats must be between 1 and 12.";
  const doors = wholeNumber(values.doors);
  if (Number.isNaN(doors) || doors < 2 || doors > 6) errors.doors = "Doors must be between 2 and 6.";

  const price = Number(values.dailyPrice);
  if (!values.dailyPrice.trim() || Number.isNaN(price) || price <= 0) errors.dailyPrice = "Enter a daily price above zero.";
  else if (price > 5000) errors.dailyPrice = "That daily price looks too high.";

  if (!values.location.trim()) errors.location = "Enter where renters pick the car up.";
  const desc = values.description.trim();
  if (desc.length < 20) errors.description = "Describe the car in at least 20 characters.";
  else if (desc.length > 1000) errors.description = "Keep the description under 1,000 characters.";
  if (imageCount > MAX_CAR_IMAGES) errors.images = `Add up to ${MAX_CAR_IMAGES} photos.`;
  return errors;
}

/** Turn validated form values into the typed input the service expects. */
export function toCarInput(values: CarFormValues, images: PartnerCarInput["images"], features: string[]): PartnerCarInput {
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    type: values.type as PartnerCarInput["type"],
    seats: Number(values.seats),
    doors: Number(values.doors),
    transmission: values.transmission as PartnerCarInput["transmission"],
    fuelType: values.fuelType as PartnerCarInput["fuelType"],
    dailyPrice: Math.round(Number(values.dailyPrice) * 100) / 100,
    location: values.location.trim(),
    description: values.description.trim(),
    images,
    features,
  };
}
