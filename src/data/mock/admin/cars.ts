import type { AdminCar, AdminCarStatus, CarApprovalStatus } from "@/types/admin";
import type { CarBodyType } from "@/types/car";
import { ago } from "./time";

const NAVY = "#2B3C5C";
const GOLD = "#C9A24B";
const SLATE = "#7C8DA8";
const PEARL = "#E9EDF4";

/** Car type, pickup branch and paint for each seed car, keyed by the same number as car(n, ...). */
const PROFILES: Record<number, { bodyType: CarBodyType; locationId: string; paint: string }> = {
  1: { bodyType: "sedan", locationId: "aloc_downtown", paint: NAVY },
  2: { bodyType: "suv", locationId: "aloc_airport", paint: PEARL },
  3: { bodyType: "hatch", locationId: "aloc_downtown", paint: SLATE },
  4: { bodyType: "sedan", locationId: "aloc_business", paint: PEARL },
  5: { bodyType: "sedan", locationId: "aloc_airport", paint: SLATE },
  6: { bodyType: "suv", locationId: "aloc_business", paint: NAVY },
  7: { bodyType: "sedan", locationId: "aloc_railway", paint: PEARL },
  8: { bodyType: "sedan", locationId: "aloc_railway", paint: GOLD },
  9: { bodyType: "suv", locationId: "aloc_harbour", paint: SLATE },
  10: { bodyType: "sedan", locationId: "aloc_downtown", paint: PEARL },
  11: { bodyType: "sedan", locationId: "aloc_airport", paint: NAVY },
  12: { bodyType: "hatch", locationId: "aloc_harbour", paint: GOLD },
  13: { bodyType: "suv", locationId: "aloc_business", paint: SLATE },
  14: { bodyType: "hatch", locationId: "aloc_railway", paint: NAVY },
  15: { bodyType: "suv", locationId: "aloc_harbour", paint: PEARL },
  16: { bodyType: "suv", locationId: "aloc_downtown", paint: GOLD },
  17: { bodyType: "hatch", locationId: "aloc_airport", paint: PEARL },
  18: { bodyType: "coupe", locationId: "aloc_harbour", paint: GOLD },
  19: { bodyType: "hatch", locationId: "aloc_railway", paint: SLATE },
  20: { bodyType: "suv", locationId: "aloc_business", paint: NAVY },
  21: { bodyType: "suv", locationId: "aloc_downtown", paint: PEARL },
};

function car(
  n: number,
  partnerId: string,
  make: string,
  model: string,
  year: number,
  dailyPrice: number,
  status: AdminCarStatus,
  approvalStatus: CarApprovalStatus,
  createdDaysAgo: number,
): AdminCar {
  return {
    id: `acar_${String(n).padStart(3, "0")}`,
    partnerId,
    make,
    model,
    year,
    ...PROFILES[n],
    dailyPrice,
    status,
    approvalStatus,
    createdAt: ago(createdDaysAgo),
  };
}

/**
 * Seed cars. "booked" cars each have an active reservation in ./reservations.
 * Pending cars start as "available": once an admin approves them they go live as Active.
 */
export const adminCars: AdminCar[] = [
  car(1, "partner_demo", "BMW", "3 Series", 2023, 89, "available", "approved", 330),
  car(2, "partner_demo", "Toyota", "RAV4", 2022, 64, "booked", "approved", 320),
  car(3, "partner_demo", "Volkswagen", "Golf", 2021, 48, "available", "approved", 310),
  car(4, "partner_demo", "Mercedes-Benz", "C-Class", 2024, 118, "available", "pending", 2),
  car(5, "ptn_102", "Audi", "A4", 2022, 92, "available", "approved", 330),
  car(6, "ptn_102", "Audi", "Q5", 2023, 124, "booked", "approved", 300),
  car(7, "ptn_102", "Skoda", "Octavia", 2021, 45, "unavailable", "approved", 290),
  car(8, "ptn_103", "Honda", "Civic", 2022, 52, "available", "approved", 290),
  car(9, "ptn_103", "Hyundai", "Tucson", 2023, 66, "available", "approved", 280),
  car(10, "ptn_103", "Toyota", "Corolla", 2021, 43, "booked", "approved", 270),
  car(11, "ptn_104", "Tesla", "Model 3", 2023, 110, "available", "approved", 250),
  car(12, "ptn_104", "Mini", "Cooper", 2022, 58, "available", "approved", 240),
  car(13, "ptn_104", "Volvo", "XC40", 2023, 98, "available", "pending", 1),
  car(14, "ptn_105", "Ford", "Focus", 2021, 41, "available", "approved", 190),
  car(15, "ptn_105", "Kia", "Sportage", 2022, 61, "booked", "approved", 180),
  car(16, "ptn_105", "Nissan", "Qashqai", 2022, 59, "available", "approved", 170),
  car(17, "ptn_105", "Peugeot", "208", 2023, 44, "available", "approved", 150),
  car(18, "ptn_106", "Porsche", "911 Carrera", 2019, 260, "available", "pending", 1.8),
  car(19, "ptn_107", "Renault", "Clio", 2022, 39, "available", "pending", 0.3),
  car(20, "ptn_108", "Land Rover", "Range Rover Sport", 2021, 175, "unavailable", "approved", 270),
  car(21, "ptn_108", "BMW", "X5", 2022, 150, "unavailable", "rejected", 265),
];
