import { getAvailability, validateRental } from "@/features/availability";
import { RENTAL_RULES } from "@/features/availability/rules";
import { nowWall } from "@/lib/date";
import type { BookingBlock, RentalValidation, RentalWindow } from "@/types/booking";
import type { Car, CarDetail, CarListing, Location } from "@/types/car";
import type { CarSearchQuery } from "@/types/search";
import { apiCarsRepository } from "./api-repository";
import type { CarsRepository } from "./repository";

const repository: CarsRepository = apiCarsRepository;

/** Listings only need to know about the near future: is it free now, and when does it free up. */
const LISTING_HORIZON_DAYS = 60;
/** The details page calendar lets people browse this far ahead. */
const DETAIL_HORIZON_DAYS = RENTAL_RULES.calendarMonthsAhead * 31;

export const listLocations = () => repository.listLocations();

/** Cars by id, used by customer screens that show cars from reservations. */
export const getCarsByIds = (ids: string[]) => repository.getCarsByIds(ids);

/** The newest cars for the landing page. */
export const getFeaturedCars = (limit = 4) => repository.getFeaturedCars(limit);

function groupBlocks(blocks: BookingBlock[]): Map<string, BookingBlock[]> {
  const map = new Map<string, BookingBlock[]>();
  for (const b of blocks) map.set(b.carId, [...(map.get(b.carId) ?? []), b]);
  return map;
}

const locationOf = (car: Car): Location => ({ id: car.locationId, name: car.locationName, city: "", address: car.locationName });

/** Cars for the listing page, each with availability for the searched window. */
export async function searchCars(query: CarSearchQuery): Promise<CarListing[]> {
  const now = nowWall();
  const cars = await repository.findCars({ location: query.location, filters: query.filters });
  const blocks = groupBlocks(
    await repository.getBlocks(
      cars.map((c) => c.id),
      now,
      LISTING_HORIZON_DAYS,
    ),
  );

  let listings: CarListing[] = cars.map((car) => ({
    ...car,
    location: locationOf(car),
    availability: getAvailability(blocks.get(car.id) ?? [], query.window, now),
  }));

  if (query.availableOnly) listings = listings.filter((c) => c.availability.status === "available");

  const rank = { available: 0, available_from: 1, booked: 2 } as const;
  listings.sort((a, b) => {
    if (query.sort === "price-asc") return a.pricePerDay - b.pricePerDay;
    if (query.sort === "price-desc") return b.pricePerDay - a.pricePerDay;
    return rank[a.availability.status] - rank[b.availability.status] || a.pricePerDay - b.pricePerDay;
  });
  return listings;
}

/** One car with everything the details page and calendar need. Returns null when there is no such car. */
export async function getCarDetail(slug: string, window?: RentalWindow): Promise<CarDetail | null> {
  const car = await repository.getCarBySlug(slug);
  if (!car) return null;
  const now = nowWall();
  const blocks = await repository.getBlocks([car.id], now, DETAIL_HORIZON_DAYS);
  return { ...car, location: locationOf(car), blocks, now, availability: getAvailability(blocks, window, now) };
}

/**
 * Server-side gate used before a reservation proceeds. Always re-reads the
 * blocks, so a booking made a second ago is respected.
 */
export async function checkRental(carId: string, pickup?: string, ret?: string): Promise<RentalValidation> {
  const now = nowWall();
  const blocks = await repository.getBlocks([carId], now, DETAIL_HORIZON_DAYS);
  return validateRental(blocks, pickup, ret, now);
}
