import { rentalDays } from "@/lib/date";
import type { Car } from "@/types/car";
import type { ReservationView } from "@/types/reservation";
import { getCarsByIds } from "../cars";
import { ServiceError } from "../errors";
import { locationFromText } from "../mappers/cars";
import type { ReservationRecord } from "../mappers/customer";
import { apiReservationsRepository } from "./api-repository";
import type { ReservationsRepository } from "./repository";

const repository: ReservationsRepository = apiReservationsRepository;

/**
 * Join reservations with their car. A reservation whose car is no longer public is left out,
 * because there is nothing real to draw it with.
 */
async function toViews(reservations: ReservationRecord[]): Promise<ReservationView[]> {
  if (reservations.length === 0) return [];
  const cars = await getCarsByIds([...new Set(reservations.map((r) => r.carId))]);
  const carById = new Map<string, Car>(cars.map((c) => [c.id, c]));
  return reservations.flatMap((r) => {
    const car = carById.get(r.carId);
    if (!car) return [];
    const location = locationFromText(r.pickupLocationName || car.locationName);
    return [{ ...r, car, location, days: rentalDays(r.pickupDate, r.returnDate) }];
  });
}

/** Newest pickup first. */
export async function listReservations(customerId: string): Promise<ReservationView[]> {
  const views = await toViews(await repository.listForCustomer(customerId));
  return views.sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
}

export async function getReservation(id: string, customerId: string): Promise<ReservationView | null> {
  const reservation = await repository.getById(id, customerId);
  if (!reservation) return null;
  return (await toViews([reservation]))[0] ?? null;
}

export async function cancelReservation(id: string, customerId: string): Promise<ReservationView> {
  const view = (await toViews([await repository.cancel(id, customerId)]))[0];
  if (!view) throw new ServiceError("not_found", "We could not find that reservation.");
  return view;
}
