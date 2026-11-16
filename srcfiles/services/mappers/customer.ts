import type { Reservation as ApiReservation, ReservationHistoryEntry, User } from "@/types/api";
import type { Customer } from "@/types/customer";
import type { Reservation, StatusHistoryEntry } from "@/types/reservation";
import { idOf, orEmpty, slugify, toWallClock } from "./common";

export function mapCustomer(u: User): Customer {
  return {
    id: idOf(u.id),
    name: u.name,
    email: u.email,
    phone: orEmpty(u.phone),
    avatar: u.avatar || undefined,
    createdAt: u.createdAt,
  };
}

/** A reservation plus the free-text pickup location it came with. */
export interface ReservationRecord extends Reservation {
  pickupLocationName: string;
}

/** Status history, oldest first. Names are only present for partners and admins. */
export function mapHistory(rows: ReservationHistoryEntry[] | undefined): StatusHistoryEntry[] | undefined {
  return rows?.map((h) => ({
    id: idOf(h.id),
    fromStatus: h.fromStatus,
    toStatus: h.toStatus,
    changedByRole: h.changedByRole,
    changedByName: h.changedByName || undefined,
    reason: h.reason || undefined,
    at: h.createdAt,
  }));
}

export function mapReservation(r: ApiReservation): ReservationRecord {
  const place = orEmpty(r.pickupLocation);
  const hasPricing = r.subtotalAmount !== undefined;
  return {
    id: idOf(r.id),
    customerId: idOf(r.customerId),
    carId: idOf(r.carId),
    pickupLocation: slugify(place),
    pickupLocationName: place,
    // The API sends the date and the time of day separately; together they are the wall-clock moment.
    pickupDate: toWallClock(r.pickupTime ? `${r.pickupDate.slice(0, 10)}T${r.pickupTime}` : r.pickupDate),
    returnDate: toWallClock(r.returnTime ? `${r.returnDate.slice(0, 10)}T${r.returnTime}` : r.returnDate),
    status: r.status,
    dailyPrice: r.dailyPrice,
    totalPrice: r.totalPrice,
    bookingReference: r.bookingReference,
    rentalDays: r.rentalDays,
    pricing: hasPricing
      ? { subtotal: r.subtotalAmount ?? r.totalPrice, serviceFee: r.serviceFeeAmount ?? 0, tax: r.taxAmount ?? 0, total: r.totalPrice }
      : undefined,
    statusReason: r.statusReason || undefined,
    history: mapHistory(r.history),
    canCancel: r.canCancel,
    // The API has no separate cancel timestamp; the last update of a cancelled reservation is the cancellation.
    cancelledAt: r.status === "cancelled" ? r.updatedAt : undefined,
  };
}
