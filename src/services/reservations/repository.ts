import type { Reservation } from "@/types/reservation";

/**
 * Data-access contract for a customer's reservations. Records only; joining
 * cars and branches happens in ./index.ts so the API stays simple.
 *
 * Planned API, all under /api/v1, scoped to the signed-in customer by the
 * session cookie (the customerId argument is for the mock, which has no cookie):
 *   GET  /customers/me/reservations                  -> Reservation[]
 *   GET  /customers/me/reservations/:id              -> Reservation | 404
 *   POST /customers/me/reservations/:id/cancel       -> Reservation   (409 not_cancellable)
 *
 * The cancel endpoint must re-check on the server that the reservation belongs
 * to the customer and is still "upcoming", then free the car's calendar block.
 * Creating reservations and payment arrive in the next module.
 */
export interface ReservationsRepository {
  listForCustomer(customerId: string): Promise<Reservation[]>;
  getById(id: string, customerId: string): Promise<Reservation | null>;
  cancel(id: string, customerId: string): Promise<Reservation>;
}
