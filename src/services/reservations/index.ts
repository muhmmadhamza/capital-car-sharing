import { rentalDays } from "@/lib/date";
import type { BookingWindowInput, ReservationQuote } from "@/types/api";
import type { Car } from "@/types/car";
import type { ReservationView } from "@/types/reservation";
import { getCarsByIds } from "../cars";
import { ServiceError } from "../errors";
import { locationFromText } from "../mappers/cars";
import { numericId } from "../mappers/common";
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
    // The server's count is the one the customer was charged for; the local one is only a fallback for old rows.
    return [{ ...r, car, location, days: r.rentalDays ?? rentalDays(r.pickupDate, r.returnDate) }];
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

export async function cancelReservation(id: string, customerId: string, reason?: string): Promise<ReservationView> {
  const view = (await toViews([await repository.cancel(id, customerId, reason?.trim() || undefined)]))[0];
  if (!view) throw new ServiceError("not_found", "We could not find that reservation.");
  return view;
}

/** The booking window the customer chose, as the API wants it. The car id is the API's numeric id. */
export type BookingRequest = Omit<BookingWindowInput, "carId"> & { carId: string };

function toApiInput(request: BookingRequest): BookingWindowInput {
  const carId = numericId(request.carId);
  if (carId === null) throw new ServiceError("not_found", "We could not find that car.");
  return { ...request, carId };
}

/** Availability and the server's price breakdown for a window. Creates nothing. */
export const quoteBooking = (request: BookingRequest): Promise<ReservationQuote> => repository.quote(toApiInput(request));

/**
 * Confirms the reservation. The server re-checks verification, availability and price, so this can fail with
 * "verification_required" (not approved), "conflict" (dates just taken) or "invalid_input".
 */
export async function createBooking(request: BookingRequest): Promise<ReservationView> {
  const view = (await toViews([await repository.create(toApiInput(request))]))[0];
  if (!view) throw new ServiceError("not_found", "Your reservation was created, but we could not load it. Check My Reservations.");
  return view;
}
