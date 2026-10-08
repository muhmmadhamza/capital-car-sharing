import { addDays, combine, dateOf, nowWall, rentalDays } from "@/lib/date";
import type { DateKey } from "@/types/booking";
import type { PartnerReservation, ReservationCustomer } from "@/types/partner";
import type { ReservationStatus } from "@/types/reservation";
import { seedPartnerCars } from "./partner-cars";
import { DEMO_PARTNER_ID } from "./partners";

/**
 * Customers a partner may see on their reservations. In the real system the
 * API joins the `customers` table and returns only these three contact fields.
 */
export const mockReservationCustomers: ReservationCustomer[] = [
  { id: "cust_demo", name: "Amelia Hart", email: "demo@capitalcarsharing.example", phone: "+1 555 010 4477" },
  { id: "cust_201", name: "Marcus Webb", email: "marcus.webb@example.com", phone: "+1 555 010 2231" },
  { id: "cust_202", name: "Priya Nair", email: "priya.nair@example.com", phone: "+1 555 010 8842" },
  { id: "cust_203", name: "Tomás Herrera", email: "tomas.herrera@example.com", phone: "+1 555 010 6615" },
  { id: "cust_204", name: "Sofia Lindqvist", email: "sofia.lindqvist@example.com", phone: "+1 555 010 3390" },
  { id: "cust_205", name: "James Okafor", email: "james.okafor@example.com", phone: "+1 555 010 7728" },
];

function make(
  n: number,
  customerId: string,
  carId: string,
  fromDay: number,
  fromTime: string,
  toDay: number,
  toTime: string,
  status: ReservationStatus,
  base: DateKey,
): PartnerReservation {
  const car = seedPartnerCars.find((c) => c.id === carId);
  if (!car) throw new Error(`Mock partner reservation references unknown car ${carId}`);
  const pickupDate = combine(addDays(base, fromDay), fromTime);
  const returnDate = combine(addDays(base, toDay), toTime);
  return {
    id: `pres_${2000 + n}`,
    customerId,
    partnerId: DEMO_PARTNER_ID,
    carId,
    pickupLocation: car.location,
    pickupDate,
    returnDate,
    status,
    dailyPrice: car.dailyPrice,
    totalPrice: car.dailyPrice * rentalDays(pickupDate, returnDate),
  };
}

/** Generated relative to today so statuses always match the dates. */
export function getSeedPartnerReservations(): PartnerReservation[] {
  const base = dateOf(nowWall());
  const r = (...a: [number, string, string, number, string, number, string, ReservationStatus]) => make(...a, base);
  return [
    r(1, "cust_201", "pcar_001", -1, "09:00", 2, "18:00", "active"),
    r(2, "cust_202", "pcar_002", 4, "10:00", 7, "10:00", "upcoming"),
    r(3, "cust_203", "pcar_003", 9, "11:00", 11, "11:00", "upcoming"),
    r(4, "cust_demo", "pcar_001", 12, "08:00", 15, "20:00", "upcoming"),
    r(5, "cust_204", "pcar_002", 20, "09:00", 23, "09:00", "upcoming"),
    r(6, "cust_205", "pcar_002", -20, "10:00", -17, "10:00", "completed"),
    r(7, "cust_202", "pcar_001", -45, "09:00", -42, "09:00", "completed"),
    r(8, "cust_201", "pcar_003", -70, "14:00", -66, "14:00", "completed"),
    r(9, "cust_204", "pcar_004", -30, "10:00", -28, "10:00", "completed"),
    r(10, "cust_203", "pcar_003", 13, "10:00", 14, "10:00", "cancelled"),
    r(11, "cust_205", "pcar_002", -5, "10:00", -3, "10:00", "cancelled"),
  ];
}

/** Days from today that the demo partner has paused by hand, per car. */
export function getSeedUnavailableDates(): Record<string, DateKey[]> {
  const base = dateOf(nowWall());
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => addDays(base, from + i));
  return {
    pcar_003: range(16, 18),
    pcar_002: [addDays(base, 27), addDays(base, 28)],
    pcar_001: [addDays(base, 25)],
  };
}
