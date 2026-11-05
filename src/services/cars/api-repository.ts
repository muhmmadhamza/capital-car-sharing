import { addDays, dateOf } from "@/lib/date";
import type { BookingBlock } from "@/types/booking";
import type { Car } from "@/types/car";
import type { CarFilters } from "@/types/search";
import type { CarSearchFilters } from "@/types/api";
import { carsService } from "../api/cars.service";
import { fetchAll } from "../api/paginate";
import { guard, isServiceError } from "../errors";
import { availabilityToBlocks, bodyTypeToApi, idFromSlug, locationsFromCars, mapCar } from "../mappers/cars";
import { numericId } from "../mappers/common";
import type { CarsRepository } from "./repository";

/** How many availability requests run at once, so a long listing does not flood the API. */
const CONCURRENCY = 6;

async function mapPool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i]);
      }
    }),
  );
  return results;
}

function matches(car: Car, f: CarFilters): boolean {
  if (f.bodyTypes.length && !f.bodyTypes.includes(car.bodyType)) return false;
  if (f.fuels.length && !f.fuels.includes(car.fuel)) return false;
  if (f.transmission && car.transmission !== f.transmission) return false;
  if (f.minSeats !== undefined && car.seats < f.minSeats) return false;
  if (f.minPrice !== undefined && car.pricePerDay < f.minPrice) return false;
  if (f.maxPrice !== undefined && car.pricePerDay > f.maxPrice) return false;
  return true;
}

const searchAll = (params: CarSearchFilters) => fetchAll((page, limit) => carsService.search({ ...params, page, limit }).then(({ cars, meta }) => ({ items: cars, meta })));

export const apiCarsRepository: CarsRepository = {
  async listLocations() {
    return locationsFromCars(await guard(() => searchAll({})));
  },

  async findCars({ location, filters }) {
    // Send what the API can filter on unambiguously, then apply every filter again here
    // so a different matching rule on the server can never show a car that does not fit.
    const params: CarSearchFilters = {
      location: location || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      transmission: filters.transmission,
      carType: filters.bodyTypes.length === 1 ? bodyTypeToApi(filters.bodyTypes[0]) : undefined,
      fuelType: filters.fuels.length === 1 ? filters.fuels[0] : undefined,
      sort: "newest",
    };
    const cars = await guard(() => searchAll(params));
    return cars.map(mapCar).filter((c) => matches(c, filters));
  },

  async getFeaturedCars(limit) {
    const { cars } = await guard(() => carsService.search({ sort: "newest", page: 1, limit }));
    return cars.slice(0, limit).map(mapCar);
  },

  async getCarBySlug(slug) {
    const id = idFromSlug(slug);
    if (id === null) return null;
    try {
      return mapCar(await guard(() => carsService.getById(id)));
    } catch (e) {
      if (isServiceError(e) && e.code === "not_found") return null;
      throw e;
    }
  },

  async getCarsByIds(ids) {
    const numeric = ids.map(numericId).filter((n): n is number => n !== null);
    const results = await Promise.allSettled(numeric.map((id) => guard(() => carsService.getById(id))));
    const cars: Car[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") cars.push(mapCar(r.value));
      // A car that is no longer public answers 404 and is skipped; any other failure is a real error.
      else if (!(isServiceError(r.reason) && r.reason.code === "not_found")) throw r.reason;
    }
    return cars;
  },

  async getBlocks(carIds, from, horizonDays) {
    const startDate = dateOf(from);
    const endDate = addDays(startDate, horizonDays);
    const lists = await mapPool(carIds, async (carId): Promise<BookingBlock[]> => {
      const id = numericId(carId);
      if (id === null) return [];
      const availability = await guard(() => carsService.getAvailability(id, { startDate, endDate }));
      return availabilityToBlocks(carId, availability).filter((b) => b.end > from);
    });
    return lists.flat();
  },
};
