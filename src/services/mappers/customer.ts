import type { Reservation as ApiReservation, User } from "@/types/api";
import type { Customer } from "@/types/customer";
import type { Reservation } from "@/types/reservation";
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

export function mapReservation(r: ApiReservation): ReservationRecord {
  const place = orEmpty(r.pickupLocation);
  return {
    id: idOf(r.id),
    customerId: idOf(r.customerId),
    carId: idOf(r.carId),
    pickupLocation: slugify(place),
    pickupLocationName: place,
    pickupDate: toWallClock(r.pickupDate),
    returnDate: toWallClock(r.returnDate),
    status: r.status,
    dailyPrice: r.dailyPrice,
    totalPrice: r.totalPrice,
    // The API has no separate cancel timestamp; the last update of a cancelled reservation is the cancellation.
    cancelledAt: r.status === "cancelled" ? r.updatedAt : undefined,
  };
}
