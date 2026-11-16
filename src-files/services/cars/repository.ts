import type { BookingBlock } from "@/types/booking";
import type { Car, Location } from "@/types/car";
import type { CarFilters } from "@/types/search";

/**
 * Data-access contract for cars and availability. The UI never talks to the
 * API client directly; it goes through this interface, so screens stay the
 * same whatever the backend looks like.
 *
 * Implemented by ./api-repository.ts on top of src/services/api/cars.service.ts:
 *   GET /cars?location=&carType=&minPrice=&maxPrice=&transmission=&fuelType=&sort=&page=&limit=
 *   GET /cars/:id
 *   GET /cars/:id/availability?startDate=&endDate=
 *
 * Availability itself is computed in src/features/availability from the blocks,
 * and the reservation endpoint must run the same validateRental() check again.
 */
export interface CarsRepository {
  /** Pickup places that currently have cars. */
  listLocations(): Promise<Location[]>;
  /** Cars matching the filters. `location` is a free-text query. */
  findCars(query: { location: string; filters: CarFilters }): Promise<Car[]>;
  /** The newest cars, for the landing page. */
  getFeaturedCars(limit: number): Promise<Car[]>;
  getCarBySlug(slug: string): Promise<Car | null>;
  /** Several cars by id, for screens that show cars from another record (e.g. reservations). Cars that are not public any more are skipped. */
  getCarsByIds(ids: string[]): Promise<Car[]>;
  /** Blocks ending after `from`, up to `horizonDays` ahead, for the given cars. */
  getBlocks(carIds: string[], from: string, horizonDays: number): Promise<BookingBlock[]>;
}
