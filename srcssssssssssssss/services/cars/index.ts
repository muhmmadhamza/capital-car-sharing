import { getAvailability, validateRental } from "@/features/availability";
import { nowWall } from "@/lib/date";
import type { BookingBlock, RentalValidation, RentalWindow } from "@/types/booking";
import type { CarDetail, CarListing, Location } from "@/types/car";
import type { CarSearchQuery } from "@/types/search";
import { httpRepository } from "./http-repository";
import { mockRepository } from "./mock-repository";
import type { CarsRepository } from "./repository";

/** "mock" (default) or "api". Flip this once the backend is live. */
const repository: CarsRepository = process.env.CARS_DATA_SOURCE === "api" ? httpRepository : mockRepository;

export const listLocations = () => repository.listLocations();

function groupBlocks(blocks: BookingBlock[]): Map<string, BookingBlock[]> {
  const map = new Map<string, BookingBlock[]>();
  for (const b of blocks) map.set(b.carId, [...(map.get(b.carId) ?? []), b]);
  return map;
}

/** Cars for the listing page, each with availability for the searched window. */
export async function searchCars(query: CarSearchQuery): Promise<CarListing[]> {
  const now = nowWall();
  const [cars, locations] = await Promise.all([
    repository.findCars({ location: query.location, filters: query.filters }),
    repository.listLocations(),
  ]);
  const blocks = groupBlocks(await repository.getBlocks(cars.map((c) => c.id), now));
  const locationById = new Map<string, Location>(locations.map((l) => [l.id, l]));

  let listings: CarListing[] = cars.flatMap((car) => {
    const location = locationById.get(car.locationId);
    if (!location) return [];
    return [{ ...car, location, availability: getAvailability(blocks.get(car.id) ?? [], query.window, now) }];
  });

  if (query.availableOnly) listings = listings.filter((c) => c.availability.status === "available");

  const rank = { available: 0, available_from: 1, booked: 2 } as const;
  listings.sort((a, b) => {
    if (query.sort === "price-asc") return a.pricePerDay - b.pricePerDay;
    if (query.sort === "price-desc") return b.pricePerDay - a.pricePerDay;
    return rank[a.availability.status] - rank[b.availability.status] || a.pricePerDay - b.pricePerDay;
  });
  return listings;
}

/** One car with everything the details page and calendar need. */
export async function getCarDetail(slug: string, window?: RentalWindow): Promise<CarDetail | null> {
  const car = await repository.getCarBySlug(slug);
  if (!car) return null;
  const now = nowWall();
  const [locations, blocks] = await Promise.all([repository.listLocations(), repository.getBlocks([car.id], now)]);
  const location = locations.find((l) => l.id === car.locationId);
  if (!location) return null;
  return { ...car, location, blocks, now, availability: getAvailability(blocks, window, now) };
}

/**
 * Server-side gate used before a reservation proceeds. Always re-reads the
 * blocks, so a booking made a second ago is respected.
 */
export async function checkRental(carId: string, pickup?: string, ret?: string): Promise<RentalValidation> {
  const now = nowWall();
  const blocks = await repository.getBlocks([carId], now);
  return validateRental(blocks, pickup, ret, now);
}
