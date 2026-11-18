import { addDays } from "@/lib/date";
import type { Car as ApiCar, CarAvailability, CarType, FuelType as ApiFuelType } from "@/types/api";
import type { BookingBlock } from "@/types/booking";
import type { Car, CarBodyType, CarImage, FuelType, Location } from "@/types/car";
import { idOf, paintFor, slugify, toDateKey } from "./common";

const BODY_FROM_API: Record<CarType, CarBodyType> = {
  Sedan: "sedan",
  SUV: "suv",
  Hatchback: "hatch",
  Coupe: "coupe",
  Luxury: "luxury",
  Van: "van",
  Convertible: "convertible",
  Pickup: "pickup",
};

const BODY_TO_API: Record<CarBodyType, CarType> = {
  sedan: "Sedan",
  suv: "SUV",
  hatch: "Hatchback",
  coupe: "Coupe",
  luxury: "Luxury",
  van: "Van",
  convertible: "Convertible",
  pickup: "Pickup",
};

export const bodyTypeFromApi = (type: CarType | string): CarBodyType => BODY_FROM_API[type as CarType] ?? "sedan";
export const bodyTypeToApi = (type: CarBodyType): CarType => BODY_TO_API[type];
export const fuelFromApi = (fuel: ApiFuelType): FuelType => fuel;

/** The API has one free-text location per car. It becomes the branch the UI works with. */
export function locationFromText(text: string): Location {
  const name = text.trim();
  return { id: slugify(name) || "unknown", name, city: "", address: name };
}

/** URL segment for a car: "42-toyota-corolla-2022". The leading number is the API id. */
export const carSlug = (car: Pick<ApiCar, "id" | "make" | "model" | "year">) => `${car.id}-${slugify(`${car.make} ${car.model} ${car.year}`)}`;

/** Reads the API id back out of a slug. Returns null for anything that does not start with a number. */
export function idFromSlug(slug: string): number | null {
  const m = /^(\d+)(?:-|$)/.exec(slug);
  return m ? Number(m[1]) : null;
}

export function imagesFromUrls(urls: string[] | null | undefined, alt: string): CarImage[] {
  const list = (urls ?? []).filter(Boolean);
  if (list.length === 0) return [{ alt, label: "Photo coming soon" }];
  return list.map((src, i) => ({ src, alt, label: `Photo ${i + 1}` }));
}

export function mapCar(c: ApiCar): Car {
  const name = `${c.make} ${c.model}`;
  const id = idOf(c.id);
  return {
    id,
    slug: carSlug(c),
    make: c.make,
    model: c.model,
    year: c.year,
    bodyType: bodyTypeFromApi(c.type),
    category: c.type,
    seats: c.seats,
    transmission: c.transmission,
    fuel: fuelFromApi(c.fuelType),
    pricePerDay: c.dailyPrice,
    paint: paintFor(id),
    locationId: locationFromText(c.location).id,
    locationName: c.location.trim(),
    doors: c.doors,
    description: c.description ?? "",
    features: c.features ?? [],
    images: imagesFromUrls(c.images, name),
  };
}

/** Locations seen across a list of cars, one per distinct text, sorted by name. */
export function locationsFromCars(cars: Pick<ApiCar, "location">[]): Location[] {
  const byId = new Map<string, Location>();
  for (const c of cars) {
    if (!c.location?.trim()) continue;
    const loc = locationFromText(c.location);
    if (!byId.has(loc.id)) byId.set(loc.id, loc);
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Consecutive dates become one block that ends (exclusive) at midnight after the last day. */
function datesToBlocks(carId: string, kind: BookingBlock["kind"], dates: string[]): BookingBlock[] {
  const sorted = [...new Set(dates.map(toDateKey))].sort();
  const blocks: BookingBlock[] = [];
  let start: string | undefined;
  let prev: string | undefined;
  const flush = () => {
    if (start && prev) {
      blocks.push({ id: `${carId}:${kind}:${start}`, carId, start: `${start}T00:00`, end: `${addDays(prev, 1)}T00:00`, kind });
    }
  };
  for (const d of sorted) {
    if (prev && addDays(prev, 1) === d) {
      prev = d;
      continue;
    }
    flush();
    start = d;
    prev = d;
  }
  flush();
  return blocks;
}

/** Turns the API's per-day availability into the blocks the calendar and availability rules use. */
export function availabilityToBlocks(carId: string, a: Pick<CarAvailability, "unavailableDates" | "bookedDates">): BookingBlock[] {
  const booked = new Set((a.bookedDates ?? []).map(toDateKey));
  const blockedOnly = (a.unavailableDates ?? []).filter((d) => !booked.has(toDateKey(d)));
  return [...datesToBlocks(carId, "booking", a.bookedDates ?? []), ...datesToBlocks(carId, "blocked", blockedOnly)].sort((x, y) => x.start.localeCompare(y.start));
}
