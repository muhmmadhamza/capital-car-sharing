import type { BookingBlock } from "@/types/booking";
import type { Car, Location } from "@/types/car";
import type { CarFilters } from "@/types/search";

/**
 * Data-access contract for cars and bookings. The UI never talks to mock data
 * directly; it goes through this interface, so moving to the real backend is
 * one new class, not a rewrite.
 *
 * Planned API (Node.js + PostgreSQL), all under /api/v1:
 *   GET /cars?location=&type=&minPrice=&maxPrice=&minSeats=&transmission=&fuel=   -> Car[]
 *   GET /cars/:slug                                                              -> Car | 404
 *   GET /cars/blocks?carId=a&carId=b&from=YYYY-MM-DDTHH:mm                       -> BookingBlock[]
 *   GET /locations                                                               -> Location[]
 *
 * Availability itself is computed in src/features/availability from the blocks,
 * and the reservation endpoint must run the same validateRental() check again,
 * backed by an exclusion constraint on (car_id, tsrange(start_at, end_at)).
 */
export interface CarsRepository {
  listLocations(): Promise<Location[]>;
  /** Static attribute filtering only. `location` is a free-text query matched against branches. */
  findCars(query: { location: string; filters: CarFilters }): Promise<Car[]>;
  getCarBySlug(slug: string): Promise<Car | null>;
  /** Blocks ending after `from` for the given cars. */
  getBlocks(carIds: string[], from: string): Promise<BookingBlock[]>;
}
