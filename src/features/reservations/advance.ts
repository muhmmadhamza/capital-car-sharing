import { addDays, combine, dateOf, diffHours } from "@/lib/date";
import { RENTAL_RULES } from "@/features/availability/rules";
import type { BookingType, WallClock } from "@/types/booking";

/**
 * Advance reservations. The API decides a booking's type and refuses anything that does not qualify; these helpers only
 * give the customer a faster, friendlier hint before the request is sent.
 */

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = { standard: "Standard", advance: "Advance" };

export const isAdvance = (r: { bookingType?: BookingType }) => r.bookingType === "advance";

/** Earliest pickup the advance search accepts: `now` plus the minimum lead time. */
export function earliestAdvancePickup(now: WallClock): WallClock {
  const d = new Date(`${now}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() + RENTAL_RULES.advanceMinHours * 60);
  return d.toISOString().slice(0, 16);
}

/** The first calendar date a customer can choose for an advance search. */
export const earliestAdvanceDate = (now: WallClock) => dateOf(earliestAdvancePickup(now));

/** Whole days between now and pickup, for "in 12 days". */
export const daysUntil = (pickup: WallClock, now: WallClock) => Math.floor(diffHours(now, pickup) / 24);

export interface AdvanceFields {
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

/** Why the chosen dates cannot be an advance reservation, or null. Mirrors the API's rules. */
export function advanceFieldsError(f: AdvanceFields, now: WallClock): string | null {
  if (!f.pickupDate || !f.returnDate) return "Choose a pickup and a return date.";
  const pickup = combine(f.pickupDate, f.pickupTime);
  const ret = combine(f.returnDate, f.returnTime);
  if (pickup < earliestAdvancePickup(now)) {
    return `Advance reservations start at least ${RENTAL_RULES.advanceMinHours} hours from now. For a sooner trip, use Browse cars.`;
  }
  if (ret <= pickup) return "Return must be after pickup.";
  const hours = diffHours(pickup, ret);
  if (hours < RENTAL_RULES.minHours) return `Rentals start at ${RENTAL_RULES.minHours} hours.`;
  if (hours > RENTAL_RULES.maxDays * 24) return `Rentals can be up to ${RENTAL_RULES.maxDays} days.`;
  if (f.pickupDate > addDays(dateOf(now), RENTAL_RULES.maxAdvanceDays)) return `Pickup can be at most ${RENTAL_RULES.maxAdvanceDays} days from today.`;
  return null;
}
