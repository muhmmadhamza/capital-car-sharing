import type { ReservationRecord } from "../mappers/customer";

/**
 * Data-access contract for a customer's reservations. Records only; joining
 * cars happens in ./index.ts so the repository stays simple.
 *
 * Implemented by ./api-repository.ts on top of src/services/api/customer.service.ts:
 *   GET /customers/me/reservations
 *
 * The session decides whose reservations come back; the customerId argument is only used to
 * make sure a record belongs to the person asking.
 *
 * Not offered by the backend yet (these report "unavailable", never a fake success):
 *   - cancelling a reservation
 */
export interface ReservationsRepository {
  listForCustomer(customerId: string): Promise<ReservationRecord[]>;
  getById(id: string, customerId: string): Promise<ReservationRecord | null>;
  cancel(id: string, customerId: string): Promise<ReservationRecord>;
}
