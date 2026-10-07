import { addDays, combine, dateOf, nowWall, rentalDays } from "@/lib/date";
import type { Reservation, ReservationStatus } from "@/types/reservation";
import { mockCars } from "./cars";
import { DEMO_CUSTOMER_ID } from "./customers";

/**
 * Mock reservations for the demo customer, generated relative to today so the
 * statuses always make sense (an "upcoming" trip is never in the past).
 * New accounts start with none. Cancellations are stored separately by the
 * mock repository, so this list stays pure.
 */
function make(
  n: number,
  carId: string,
  fromDay: number,
  fromTime: string,
  toDay: number,
  toTime: string,
  status: ReservationStatus,
): Reservation {
  const car = mockCars.find((c) => c.id === carId);
  if (!car) throw new Error(`Mock reservation references unknown car ${carId}`);
  const base = dateOf(nowWall());
  const pickupDate = combine(addDays(base, fromDay), fromTime);
  const returnDate = combine(addDays(base, toDay), toTime);
  return {
    id: `res_${1000 + n}`,
    customerId: DEMO_CUSTOMER_ID,
    carId,
    pickupLocation: car.locationId,
    pickupDate,
    returnDate,
    status,
    dailyPrice: car.pricePerDay,
    totalPrice: car.pricePerDay * rentalDays(pickupDate, returnDate),
  };
}

export function getSeedReservations(): Reservation[] {
  return [
    make(1, "car_005", -1, "09:00", 2, "18:00", "active"),
    make(2, "car_001", 10, "10:00", 13, "10:00", "upcoming"),
    make(3, "car_009", 25, "09:00", 30, "09:00", "upcoming"),
    make(4, "car_010", 40, "10:00", 42, "12:00", "upcoming"),
    make(5, "car_003", -30, "10:00", -27, "10:00", "completed"),
    make(6, "car_011", -60, "14:00", -56, "14:00", "completed"),
    make(7, "car_012", -90, "09:00", -88, "09:00", "completed"),
    make(8, "car_002", -10, "11:00", -8, "11:00", "cancelled"),
    make(9, "car_008", 20, "10:00", 22, "10:00", "cancelled"),
  ];
}
