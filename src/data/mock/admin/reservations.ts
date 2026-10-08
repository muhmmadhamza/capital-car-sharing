import { addDays, combine, dateOf, nowWall, rentalDays } from "@/lib/date";
import type { AdminReservation } from "@/types/admin";
import type { ReservationStatus } from "@/types/reservation";
import { adminCars } from "./cars";
import { locationName } from "./locations";
import { ago } from "./time";

const today = dateOf(nowWall());

/** Pickup and return are 10:00 wall-clock; `startDay` is relative to today (negative = in the past). */
function reservation(
  n: number,
  customerId: string,
  carId: string,
  startDay: number,
  nights: number,
  status: ReservationStatus,
  createdDaysAgo: number,
): AdminReservation {
  const car = adminCars.find((c) => c.id === carId);
  if (!car) throw new Error(`Mock admin reservation references unknown car ${carId}`);
  const pickupDate = combine(addDays(today, startDay), "10:00");
  const returnDate = combine(addDays(today, startDay + nights), "10:00");
  return {
    id: `ares_${3000 + n}`,
    customerId,
    partnerId: car.partnerId,
    carId,
    // Cars are picked up at their own branch.
    pickupLocation: locationName(car.locationId),
    pickupDate,
    returnDate,
    status,
    dailyPrice: car.dailyPrice,
    totalPrice: car.dailyPrice * rentalDays(pickupDate, returnDate),
    createdAt: ago(createdDaysAgo),
  };
}

/**
 * Seed reservations: 18 completed, 4 active (one per "booked" car), 7 upcoming
 * and 3 cancelled. Every reservation was created after its customer registered.
 */
export const adminReservations: AdminReservation[] = [
  // completed
  reservation(1, "cust_demo", "acar_001", -30, 3, "completed", 36),
  reservation(2, "cust_demo", "acar_005", -14, 2, "completed", 18),
  reservation(3, "cust_201", "acar_003", -40, 5, "completed", 45),
  reservation(4, "cust_201", "acar_008", -22, 3, "completed", 26),
  reservation(5, "cust_202", "acar_011", -35, 4, "completed", 40),
  reservation(6, "cust_202", "acar_009", -9, 2, "completed", 13),
  reservation(7, "cust_203", "acar_012", -28, 3, "completed", 33),
  reservation(8, "cust_204", "acar_014", -20, 7, "completed", 25),
  reservation(9, "cust_204", "acar_016", -50, 4, "completed", 55),
  reservation(10, "cust_205", "acar_005", -60, 3, "completed", 66),
  reservation(11, "cust_206", "acar_017", -17, 2, "completed", 21),
  reservation(12, "cust_207", "acar_008", -45, 3, "completed", 50),
  reservation(13, "cust_208", "acar_011", -12, 3, "completed", 16),
  reservation(14, "cust_209", "acar_001", -55, 4, "completed", 60),
  reservation(15, "cust_210", "acar_020", -70, 5, "completed", 75),
  reservation(16, "cust_211", "acar_009", -26, 3, "completed", 30),
  reservation(17, "cust_212", "acar_003", -8, 2, "completed", 12),
  reservation(18, "cust_demo", "acar_002", -75, 4, "completed", 80),
  // active
  reservation(19, "cust_201", "acar_002", -1, 4, "active", 8),
  reservation(20, "cust_208", "acar_006", -2, 5, "active", 10),
  reservation(21, "cust_209", "acar_010", -1, 3, "active", 6),
  reservation(22, "cust_211", "acar_015", -1, 6, "active", 9),
  // upcoming
  reservation(23, "cust_demo", "acar_011", 5, 3, "upcoming", 3),
  reservation(24, "cust_202", "acar_001", 8, 4, "upcoming", 2),
  reservation(25, "cust_203", "acar_005", 3, 2, "upcoming", 1),
  reservation(26, "cust_206", "acar_006", 10, 3, "upcoming", 2),
  reservation(27, "cust_212", "acar_014", 6, 5, "upcoming", 1),
  reservation(28, "cust_204", "acar_009", 14, 7, "upcoming", 0.3),
  reservation(29, "cust_208", "acar_017", 4, 3, "upcoming", 0.2),
  // cancelled
  reservation(30, "cust_201", "acar_012", 2, 2, "cancelled", 5),
  reservation(31, "cust_210", "acar_016", -5, 3, "cancelled", 9),
  reservation(32, "cust_212", "acar_003", 12, 4, "cancelled", 4),
];
