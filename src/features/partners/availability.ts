import { addDays, dateOf, daysInMonth, nowWall } from "@/lib/date";
import type { DateKey, WallClock } from "@/types/booking";
import type { Availability, CarDayStatus, PartnerCarStatus, PartnerReservation } from "@/types/partner";

type Span = Pick<PartnerReservation, "carId" | "pickupDate" | "returnDate" | "status">;

/** Reservations that occupy the car. Completed and cancelled ones free it up. */
const OCCUPYING = new Set<PartnerReservation["status"]>(["upcoming", "active"]);

/**
 * Every calendar day a car is out on a reservation, counting the pickup day and
 * the return day. These days are read-only for the partner: they are derived
 * from reservations and can never be edited by hand.
 */
export function bookedDates(reservations: Span[], carId: string): Set<DateKey> {
  const out = new Set<DateKey>();
  for (const r of reservations) {
    if (r.carId !== carId || !OCCUPYING.has(r.status)) continue;
    const last = dateOf(r.returnDate);
    for (let d = dateOf(r.pickupDate); d <= last; d = addDays(d, 1)) out.add(d);
  }
  return out;
}

export function dayStatus(date: DateKey, booked: Set<DateKey>, unavailable: Set<DateKey>): CarDayStatus {
  return booked.has(date) ? "booked" : unavailable.has(date) ? "unavailable" : "available";
}

/** One Availability row for every day of the month containing `month` ("YYYY-MM-01"). */
export function monthAvailability(carId: string, month: DateKey, booked: Set<DateKey>, unavailable: Set<DateKey>): Availability[] {
  const prefix = month.slice(0, 8);
  return Array.from({ length: daysInMonth(month) }, (_, i) => {
    const date = `${prefix}${String(i + 1).padStart(2, "0")}`;
    return { id: `${carId}_${date}`, carId, date, status: dayStatus(date, booked, unavailable) };
  });
}

/** A car is "booked" only while a reservation is active; otherwise its stored status stands. */
export function effectiveStatus(stored: PartnerCarStatus, reservations: Span[], carId: string, now: WallClock = nowWall()): PartnerCarStatus {
  if (stored === "pending") return "pending";
  const out = reservations.some((r) => r.carId === carId && r.status === "active" && r.pickupDate <= now && now < r.returnDate);
  return out ? "booked" : stored;
}
