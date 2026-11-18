import type { BookingType, WallClock } from "./booking";
import type { Car, Location } from "./car";

/** Booking workflow: pending (awaiting the partner) -> confirmed -> completed; or rejected / cancelled. */
export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";

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
  /** "advance" when booked at least the minimum lead time ahead. Reservations from before this existed are "standard". */
  bookingType: BookingType;
  /** Price per day at the time of booking. Later price changes never alter it. */
  dailyPrice: number;
  /** dailyPrice × billable days. The refundable deposit is not included. */
  totalPrice: number;
  /** ISO 8601. Set when status becomes "cancelled". */
  cancelledAt?: string;
  /** Unique, human-friendly reference, e.g. "CCS-261108-K7M2X". Quote it to support. */
  bookingReference?: string;
  /** Billable days as the server counted them. */
  rentalDays?: number;
  /** Price breakdown as stored at booking time. `total` equals `totalPrice`. */
  pricing?: ReservationPricing;
  /** Why the booking was rejected or cancelled, when someone gave a reason. */
  statusReason?: string;
  /** Status changes, oldest first. Only on the details endpoints. */
  history?: StatusHistoryEntry[];
  /** Whether the customer may cancel it right now (the API decides). */
  canCancel?: boolean;
}

export interface StatusHistoryEntry {
  id: string;
  fromStatus: ReservationStatus | null;
  toStatus: ReservationStatus;
  changedByRole: "customer" | "partner" | "admin" | "system";
  /** Only shown to partners and admins. */
  changedByName?: string;
  reason?: string;
  /** ISO 8601. */
  at: string;
}

export interface ReservationPricing {
  subtotal: number;
  serviceFee: number;
  tax: number;
  total: number;
}

/** A reservation joined with what the screens need to draw it. */
export interface ReservationView extends Reservation {
  car: Car;
  location: Location;
  days: number;
}

export interface ReservationSummary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  rejected: number;
  /** Advance reservations, whatever their status. */
  advance: number;
}
