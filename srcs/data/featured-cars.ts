import type { Car } from "@/types/car";

/**
 * Placeholder data for the landing page. Replace with a call to the cars
 * service (src/services) once the backend exists.
 */
export const featuredCars: Car[] = [
  {
    id: "car_001",
    slug: "toyota-corolla-2023",
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    bodyType: "sedan",
    category: "Compact sedan",
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    pricePerDay: 38,
    paint: "#E9EDF4",
  },
  {
    id: "car_002",
    slug: "kia-sportage-2022",
    make: "Kia",
    model: "Sportage",
    year: 2022,
    bodyType: "suv",
    category: "Family SUV",
    seats: 5,
    transmission: "Automatic",
    fuel: "Petrol",
    pricePerDay: 56,
    paint: "#7C8DA8",
  },
  {
    id: "car_003",
    slug: "suzuki-swift-2023",
    make: "Suzuki",
    model: "Swift",
    year: 2023,
    bodyType: "hatch",
    category: "City hatchback",
    seats: 5,
    transmission: "Manual",
    fuel: "Petrol",
    pricePerDay: 26,
    paint: "#C9A24B",
  },
  {
    id: "car_004",
    slug: "bmw-4-series-2022",
    make: "BMW",
    model: "4 Series",
    year: 2022,
    bodyType: "coupe",
    category: "Premium coupe",
    seats: 4,
    transmission: "Automatic",
    fuel: "Petrol",
    pricePerDay: 118,
    paint: "#2B3C5C",
  },
];
