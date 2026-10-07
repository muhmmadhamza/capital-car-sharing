import { getMockBookings } from "@/data/mock/bookings";
import { mockCars } from "@/data/mock/cars";
import { mockLocations } from "@/data/mock/locations";
import type { CarsRepository } from "./repository";

/** In-memory implementation over src/data/mock. Used until the API exists. */
export const mockRepository: CarsRepository = {
  async listLocations() {
    return mockLocations;
  },

  async findCars({ location, filters }) {
    const q = location.trim().toLowerCase();
    const matchingLocationIds = q
      ? new Set(
          mockLocations
            .filter((l) => `${l.name} ${l.city} ${l.address}`.toLowerCase().includes(q))
            .map((l) => l.id),
        )
      : null;

    return mockCars.filter((car) => {
      if (matchingLocationIds && !matchingLocationIds.has(car.locationId)) return false;
      if (filters.bodyTypes.length && !filters.bodyTypes.includes(car.bodyType)) return false;
      if (filters.fuels.length && !filters.fuels.includes(car.fuel)) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.minSeats !== undefined && car.seats < filters.minSeats) return false;
      if (filters.minPrice !== undefined && car.pricePerDay < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && car.pricePerDay > filters.maxPrice) return false;
      return true;
    });
  },

  async getCarBySlug(slug) {
    return mockCars.find((c) => c.slug === slug) ?? null;
  },

  async getBlocks(carIds, from) {
    const ids = new Set(carIds);
    return getMockBookings().filter((b) => ids.has(b.carId) && b.end > from);
  },
};
