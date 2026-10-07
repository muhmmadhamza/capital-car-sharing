import { mockCars } from "@/data/mock/cars";

/**
 * Landing-page picks. Derived from the mock catalogue so the cards link to
 * real detail pages. Replace with a "featured" query on the cars service once
 * the backend exists.
 */
export const featuredCars = mockCars.slice(0, 4);
