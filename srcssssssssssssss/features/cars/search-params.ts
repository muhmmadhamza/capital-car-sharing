import type { RentalWindow } from "@/types/booking";
import { BODY_TYPE_LABELS, type CarBodyType, type FuelType, type Transmission } from "@/types/car";
import type { CarSearchQuery, CarSort } from "@/types/search";
import { combine, isDateKey, isTimeKey, nowWall } from "@/lib/date";

export const DEFAULT_PICKUP_TIME = "10:00";

export const BODY_TYPES = Object.keys(BODY_TYPE_LABELS) as CarBodyType[];
export const FUEL_TYPES: FuelType[] = ["Petrol", "Diesel", "Hybrid", "Electric"];
export const TRANSMISSIONS: Transmission[] = ["Automatic", "Manual"];
export const SEAT_OPTIONS = [4, 5, 7] as const;
/** Bounds used by the price filter hints. */
export const PRICE_RANGE = { min: 20, max: 150 } as const;

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
const num = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** Raw form values for the four date/time fields, kept even when invalid so inputs can be refilled. */
export interface WindowFields {
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export interface ParsedSearch {
  query: CarSearchQuery;
  fields: WindowFields;
  /** Why the entered dates were ignored, if they were. */
  windowError?: string;
}

/**
 * URL -> typed search. Anything unrecognised is dropped, never trusted.
 * Pure, so it works for server components and (later) an API handler.
 */
export function parseSearchParams(raw: Raw, now: string = nowWall()): ParsedSearch {
  const pickupDate = first(raw.pickupDate) ?? "";
  const returnDate = first(raw.returnDate) ?? "";
  const pickupTime = first(raw.pickupTime) ?? "";
  const returnTime = first(raw.returnTime) ?? "";
  const fields: WindowFields = {
    pickupDate: isDateKey(pickupDate) ? pickupDate : "",
    returnDate: isDateKey(returnDate) ? returnDate : "",
    pickupTime: isTimeKey(pickupTime) ? pickupTime : DEFAULT_PICKUP_TIME,
    returnTime: isTimeKey(returnTime) ? returnTime : DEFAULT_PICKUP_TIME,
  };

  let window: RentalWindow | undefined;
  let windowError: string | undefined;
  if (fields.pickupDate && fields.returnDate) {
    const pickup = combine(fields.pickupDate, fields.pickupTime);
    const ret = combine(fields.returnDate, fields.returnTime);
    if (pickup < now) windowError = "Pickup is in the past, so we ignored your dates.";
    else if (ret <= pickup) windowError = "Return must be after pickup, so we ignored your dates.";
    else window = { pickup, return: ret };
  }

  const transmission = first(raw.transmission);
  const sort = first(raw.sort);

  return {
    fields,
    windowError,
    query: {
      location: (first(raw.location) ?? "").slice(0, 80),
      window,
      availableOnly: first(raw.availableOnly) === "1",
      sort: (["price-asc", "price-desc"] as CarSort[]).includes(sort as CarSort) ? (sort as CarSort) : "recommended",
      filters: {
        bodyTypes: all(raw.type).filter((t): t is CarBodyType => BODY_TYPES.includes(t as CarBodyType)),
        fuels: all(raw.fuel).filter((f): f is FuelType => FUEL_TYPES.includes(f as FuelType)),
        transmission: TRANSMISSIONS.includes(transmission as Transmission) ? (transmission as Transmission) : undefined,
        minSeats: num(first(raw.minSeats)),
        minPrice: num(first(raw.minPrice)),
        maxPrice: num(first(raw.maxPrice)),
      },
    },
  };
}

/** Typed state back to a query string (the inverse of parseSearchParams for the filter keys). */
export function buildQueryString(raw: Raw, overrides: Record<string, string | string[] | null> = {}): string {
  const merged: Raw = { ...raw };
  for (const [k, v] of Object.entries(overrides)) merged[k] = v === null ? undefined : v;
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    for (const item of all(v)) if (item !== "") p.append(k, item);
  }
  return p.toString();
}

/** Only the keys that describe the rental window, for passing to the details page. */
export function windowQueryString(fields: WindowFields): string {
  if (!fields.pickupDate || !fields.returnDate) return "";
  return new URLSearchParams(fields as unknown as Record<string, string>).toString();
}

export const FILTER_KEYS = ["type", "minPrice", "maxPrice", "minSeats", "transmission", "fuel", "availableOnly", "sort"] as const;
