import type {
  AvailabilityResult,
  BookingBlock,
  DateKey,
  RentalValidation,
  RentalWindow,
  WallClock,
} from "@/types/booking";
import {
  addDays,
  combine,
  dateOf,
  diffHours,
  formatDateTime,
  isWallClock,
  rentalDays,
} from "@/lib/date";
import { RENTAL_RULES } from "./rules";

/**
 * Pure availability logic. No I/O, no React, no framework imports, so the same
 * file can run in the Node.js API. In PostgreSQL the overlap rule below is
 * `tsrange(start, end) && tsrange(a, b)`, and double bookings should also be
 * prevented by the database itself with an exclusion constraint:
 *   EXCLUDE USING gist (car_id WITH =, tsrange(start_at, end_at) WITH &&)
 */

/** Half-open overlap: [aStart, aEnd) and [bStart, bEnd). Touching ranges do not clash. */
export function overlaps(aStart: WallClock, aEnd: WallClock, bStart: WallClock, bEnd: WallClock): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function findConflicts(blocks: BookingBlock[], start: WallClock, end: WallClock): BookingBlock[] {
  return blocks.filter((b) => overlaps(start, end, b.start, b.end)).sort((a, b) => a.start.localeCompare(b.start));
}

/** The block that is in progress at `at`, if any. */
export function blockAt(blocks: BookingBlock[], at: WallClock): BookingBlock | undefined {
  return blocks.find((b) => b.start <= at && at < b.end);
}

/**
 * Earliest moment at or after `from` when the car is free, following back to
 * back blocks (a booking that ends exactly when the next begins is one stretch).
 */
export function freeFrom(blocks: BookingBlock[], from: WallClock): WallClock {
  let t = from;
  for (let guard = 0; guard <= blocks.length; guard++) {
    const current = blockAt(blocks, t);
    if (!current) return t;
    t = current.end;
  }
  return t;
}

/** Start of the first block that begins at or after `from`. */
export function nextBlockStart(blocks: BookingBlock[], from: WallClock): WallClock | undefined {
  return blocks
    .filter((b) => b.start >= from)
    .map((b) => b.start)
    .sort()[0];
}

/**
 * Classify a car for the listing and detail page.
 *
 * With a rental window:
 *   no clash                         -> available
 *   pickup falls inside a booking    -> available_from (the car is still out)
 *   a booking starts mid-rental      -> booked
 * Without a window the car is judged against `now`: free now -> available,
 * currently out -> available_from.
 */
export function getAvailability(
  blocks: BookingBlock[],
  window: RentalWindow | undefined,
  now: WallClock,
): AvailabilityResult {
  const reference = window?.pickup ?? now;
  const atReference = blockAt(blocks, reference);

  if (!window) {
    return atReference
      ? { status: "available_from", availableFrom: freeFrom(blocks, reference) }
      : { status: "available" };
  }

  const conflicts = findConflicts(blocks, window.pickup, window.return);
  if (conflicts.length === 0) return { status: "available" };
  if (atReference) return { status: "available_from", availableFrom: freeFrom(blocks, reference), conflicts };
  return { status: "booked", conflicts };
}

/**
 * Authoritative check run before a reservation is accepted. The browser uses
 * it to disable the CTA; the reserve page (and later the API) uses it again,
 * because nothing the browser says can be trusted.
 */
export function validateRental(
  blocks: BookingBlock[],
  pickup: WallClock | undefined,
  ret: WallClock | undefined,
  now: WallClock,
): RentalValidation {
  if (!pickup || !ret) {
    return { ok: false, code: "incomplete", message: "Choose a pickup and return date to continue." };
  }
  if (!isWallClock(pickup) || !isWallClock(ret)) {
    return { ok: false, code: "invalid", message: "Those dates are not valid." };
  }
  if (pickup < now) {
    return { ok: false, code: "past", message: "Pickup must be in the future." };
  }
  if (ret <= pickup) {
    return { ok: false, code: "order", message: "Return must be after pickup." };
  }
  if (diffHours(pickup, ret) < RENTAL_RULES.minHours) {
    return {
      ok: false,
      code: "too_short",
      message: `Rentals start at ${RENTAL_RULES.minHours} hours.`,
    };
  }
  if (rentalDays(pickup, ret) > RENTAL_RULES.maxDays) {
    return {
      ok: false,
      code: "too_long",
      message: `Rentals can be up to ${RENTAL_RULES.maxDays} days. For longer, contact us.`,
    };
  }

  const conflicts = findConflicts(blocks, pickup, ret);
  if (conflicts.length > 0) {
    const nextAvailableFrom = freeFrom(blocks, pickup);
    const first = conflicts[0];
    const message = blockAt(blocks, pickup)
      ? `This car is out until ${formatDateTime(nextAvailableFrom)}.`
      : `This car is already booked from ${formatDateTime(first.start)}. Return before then or pick other dates.`;
    return { ok: false, code: "conflict", message, conflicts, nextAvailableFrom };
  }

  return { ok: true, days: rentalDays(pickup, ret) };
}

export type DayState = "free" | "partial" | "booked";

/** Is the whole calendar day covered by blocks (booked) or only part of it (partial)? */
export function dayState(blocks: BookingBlock[], day: DateKey): DayState {
  const start = combine(day, "00:00");
  const end = combine(addDays(day, 1), "00:00");
  if (findConflicts(blocks, start, end).length === 0) return "free";
  return freeFrom(blocks, start) >= end ? "booked" : "partial";
}

/** The last calendar day a rental starting at `pickup` can run to before the next booking. */
export function lastSelectableReturnDay(blocks: BookingBlock[], pickup: WallClock): DateKey {
  const next = nextBlockStart(blocks, pickup);
  const byRule = addDays(dateOf(pickup), RENTAL_RULES.maxDays);
  if (!next) return byRule;
  const nextDay = dateOf(next);
  return nextDay < byRule ? nextDay : byRule;
}
