import type { BookingBlock } from "@/types/booking";
import type { Car, Location } from "@/types/car";
import type { CarsRepository } from "./repository";

/**
 * Talks to the Node.js/PostgreSQL API. Not used until CARS_DATA_SOURCE=api and
 * the endpoints in repository.ts exist. Kept here so the switch is a config
 * change and the response shapes are agreed up front.
 */
const baseUrl = () => process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function get<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = `${baseUrl()}/api/v1${path}${params?.size ? `?${params}` : ""}`;
  const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (res.status === 404) throw new NotFoundError();
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

class NotFoundError extends Error {}

export const httpRepository: CarsRepository = {
  listLocations: () => get<Location[]>("/locations"),

  findCars({ location, filters }) {
    const p = new URLSearchParams();
    if (location) p.set("location", location);
    filters.bodyTypes.forEach((t) => p.append("type", t));
    filters.fuels.forEach((f) => p.append("fuel", f));
    if (filters.transmission) p.set("transmission", filters.transmission);
    if (filters.minSeats !== undefined) p.set("minSeats", String(filters.minSeats));
    if (filters.minPrice !== undefined) p.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) p.set("maxPrice", String(filters.maxPrice));
    return get<Car[]>("/cars", p);
  },

  async getCarBySlug(slug) {
    try {
      return await get<Car>(`/cars/${encodeURIComponent(slug)}`);
    } catch (e) {
      if (e instanceof NotFoundError) return null;
      throw e;
    }
  },

  getBlocks(carIds, from) {
    if (carIds.length === 0) return Promise.resolve<BookingBlock[]>([]);
    const p = new URLSearchParams({ from });
    carIds.forEach((id) => p.append("carId", id));
    return get<BookingBlock[]>("/cars/blocks", p);
  },
};
