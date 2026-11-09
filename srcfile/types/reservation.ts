import type { WallClock } from "./booking";
import type { Car, Location } from "./car";

export type ReservationStatus = "upcoming" | "active" | "completed" | "cancelled";

/** Matches the `reservations` table. */
export interface Reservation {
  id: string;
  customerId: string;
  carId: string;
  /** Location id. Cars are picked up and returned at the same branch. */
  pickupLocation: string;
  pickupDate: WallClock;
  returnDate: WallClock;
  status: ReservationStatus;
  /** Price per day at the time of booking. Later price changes never alter it. */
  dailyPrice: number;
  /** dailyPrice × billable days. The refundable deposit is not included. */
  totalPrice: number;
  /** ISO 8601. Set when status becomes "cancelled". */
  cancelledAt?: string;
}

/** A reservation joined with what the screens need to draw it. */
export interface ReservationView extends Reservation {
  car: Car;
  location: Location;
  days: number;
}

export interface ReservationSummary {
  total: number;
  upcoming: number;
  active: number;
  completed: number;
  cancelled: number;
}
