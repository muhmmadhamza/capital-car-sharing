import { rentalDays } from "@/lib/date";
import type { Car, Location } from "@/types/car";
import type { Reservation, ReservationView } from "@/types/reservation";
import { getCarsByIds, listLocations } from "../cars";
import { ServiceError } from "../errors";
import { httpReservationsRepository } from "./http-repository";
import { mockReservationsRepository } from "./mock-repository";
import type { ReservationsRepository } from "./repository";

const repository: ReservationsRepository =
  process.env.NEXT_PUBLIC_CUSTOMER_DATA_SOURCE === "api" ? httpReservationsRepository : mockReservationsRepository;

/** Join reservations with their car and branch. Reservations whose car was removed are skipped. */
async function toViews(reservations: Reservation[]): Promise<ReservationView[]> {
  if (reservations.length === 0) return [];
  const [cars, locations] = await Promise.all([getCarsByIds([...new Set(reservations.map((r) => r.carId))]), listLocations()]);
  const carById = new Map<string, Car>(cars.map((c) => [c.id, c]));
  const locationById = new Map<string, Location>(locations.map((l) => [l.id, l]));
  return reservations.flatMap((r) => {
    const car = carById.get(r.carId);
    const location = locationById.get(r.pickupLocation) ?? (car ? locationById.get(car.locationId) : undefined);
    return car && location ? [{ ...r, car, location, days: rentalDays(r.pickupDate, r.returnDate) }] : [];
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
