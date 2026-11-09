import type { BookingWindowInput, ReservationQuote } from "@/types/api";
import type { ReservationRecord } from "../mappers/customer";

/**
 * Data-access contract for a customer's reservations. Records only; joining
 * cars happens in ./index.ts so the repository stays simple.
 *
 * Implemented by ./api-repository.ts on top of src/services/api/customer.service.ts:
 *   GET  /customers/me/reservations
 *   GET  /customers/me/reservations/:id
 *   POST /customers/me/reservations/quote   (availability + price, creates nothing)
 *   POST /customers/me/reservations         (creates; the server requires an approved customer)
 *
 * The session decides whose reservations come back; the customerId argument is only used to
 * make sure a record belongs to the person asking.
 *   POST /customers/me/reservations/:id/cancel  (own booking only; the server applies the cancellation rules)
 */
export interface ReservationsRepository {
  listForCustomer(customerId: string): Promise<ReservationRecord[]>;
  getById(id: string, customerId: string): Promise<ReservationRecord | null>;
  quote(input: BookingWindowInput): Promise<ReservationQuote>;
  create(input: BookingWindowInput): Promise<ReservationRecord>;
  cancel(id: string, customerId: string, reason?: string): Promise<ReservationRecord>;
}
