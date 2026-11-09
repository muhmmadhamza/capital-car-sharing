/**
 * Wall-clock timestamp in the pickup branch's local time: "YYYY-MM-DDTHH:mm".
 *
 * Rentals are agreed in the branch's local time, so we deliberately carry no
 * offset. Strings in this format sort and compare correctly as plain strings,
 * which keeps the overlap maths identical on the server, in the browser and
 * (later) in the API. In PostgreSQL map this to `timestamp` (without time
 * zone) or convert to `tstzrange` using the location's time zone.
 */
export type WallClock = string;

/** "YYYY-MM-DD" */
export type DateKey = string;
/** "HH:mm" */
export type TimeKey = string;

/**
 * A period during which a car cannot be rented. `end` is exclusive, so a car
 * returned at 10:00 can be picked up again at 10:00.
 */
export interface BookingBlock {
  id: string;
  carId: string;
  start: WallClock;
  end: WallClock;
  /** "booking" = a customer reservation. "blocked" = owner or maintenance hold. */
  kind: "booking" | "blocked";
}

export interface RentalWindow {
  pickup: WallClock;
  return: WallClock;
}

/**
 * - available:      free for the whole window (or right now when no window is set)
 * - booked:         pickup is free, but another booking starts before the return
 * - available_from: the car is still out at pickup; it is free from `availableFrom`
 */
export type AvailabilityStatus = "available" | "booked" | "available_from";

export interface AvailabilityResult {
  status: AvailabilityStatus;
  /** Set when status is "available_from". */
  availableFrom?: WallClock;
  /** Set when status is "booked": the blocks that clash with the window. */
  conflicts?: BookingBlock[];
}

export type RentalValidation =
  | { ok: true; days: number }
  | {
      ok: false;
      code: "incomplete" | "invalid" | "past" | "order" | "too_short" | "too_long" | "conflict";
      message: string;
      conflicts?: BookingBlock[];
      /** Earliest moment the car is free again, when the code is "conflict". */
      nextAvailableFrom?: WallClock;
    };
