import type { CarBodyType, FuelType, Transmission } from "@/types/car";
import type { CarDayStatus, PartnerCarStatus } from "@/types/partner";

export const CAR_TYPES: CarBodyType[] = ["sedan", "suv", "hatch", "coupe"];
export const TRANSMISSIONS: Transmission[] = ["Automatic", "Manual"];
export const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric"];

/** Common features offered as one-tap choices. Partners can add their own too. */
export const COMMON_FEATURES = [
  "Air conditioning",
  "Bluetooth",
  "GPS navigation",
  "USB charging ports",
  "Backup camera",
  "Apple CarPlay",
  "Android Auto",
  "Cruise control",
  "Parking sensors",
  "Heated seats",
  "Sunroof",
  "Keyless entry",
  "Roof rails",
  "Child seat anchors",
] as const;

export const MAX_CAR_IMAGES = 6;
export const MIN_CAR_YEAR = 1995;

export const CAR_STATUS_LABELS: Record<PartnerCarStatus, string> = {
  available: "Available",
  booked: "Booked",
  unavailable: "Unavailable",
  pending: "Pending",
};

export const DAY_STATUS_LABELS: Record<CarDayStatus, string> = {
  available: "Available",
  unavailable: "Unavailable",
  booked: "Booked",
};

/** Statuses a partner may choose for a listing. "booked" and "pending" are set by the system. */
export const EDITABLE_LISTING_STATUSES: PartnerCarStatus[] = ["available", "unavailable"];
