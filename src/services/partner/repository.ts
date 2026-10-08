import type { DateKey } from "@/types/booking";
import type {
  Availability,
  PartnerCarInput,
  PartnerCarView,
  PartnerReservationView,
  PartnerStats,
  PartnerCarStatus,
} from "@/types/partner";

/**
 * Data-access contract for everything a partner manages: cars, availability
 * and reservations. The UI only calls src/services/partner, so the mock can be
 * replaced by Next.js -> Node.js API -> PostgreSQL without touching a screen.
 *
 * Every call is scoped to the signed-in partner. In mock mode the partner id is
 * passed in; the real API reads it from the session cookie and ignores any id
 * the browser sends.
 *
 * Planned API, all under /api/v1 (404 when the item is not the partner's):
 *   GET    /partner/stats                                    -> PartnerStats
 *   GET    /partner/cars                                     -> PartnerCarView[]
 *   POST   /partner/cars               PartnerCarInput       -> PartnerCarView   (starts as "pending")
 *   GET    /partner/cars/:id                                 -> PartnerCarView
 *   PATCH  /partner/cars/:id           PartnerCarInput + listingStatus -> PartnerCarView
 *   DELETE /partner/cars/:id                                 -> 204   (409 conflict while reservations are open)
 *   POST   /partner/cars/images        multipart image       -> { url }
 *   GET    /partner/cars/:id/availability?month=YYYY-MM-01   -> Availability[]
 *   PUT    /partner/cars/:id/availability  { dates, status } -> 204   (409 conflict if a date is booked)
 *   GET    /partner/reservations                             -> PartnerReservationView[]
 *   GET    /partner/reservations/:id                         -> PartnerReservationView
 */
export interface PartnerDataRepository {
  getStats(partnerId: string): Promise<PartnerStats>;

  listCars(partnerId: string): Promise<PartnerCarView[]>;
  getCar(partnerId: string, carId: string): Promise<PartnerCarView | null>;
  createCar(partnerId: string, input: PartnerCarInput): Promise<PartnerCarView>;
  updateCar(partnerId: string, carId: string, input: PartnerCarInput, listingStatus?: PartnerCarStatus): Promise<PartnerCarView>;
  deleteCar(partnerId: string, carId: string): Promise<void>;
  uploadCarImage(file: File): Promise<string>;

  /** One row per day of the month, with "booked" days included and read-only. */
  getAvailability(partnerId: string, carId: string, month: DateKey): Promise<Availability[]>;
  /** Marks days available or unavailable. Rejects the whole request if any day is booked. */
  setAvailability(partnerId: string, carId: string, dates: DateKey[], status: "available" | "unavailable"): Promise<void>;

  listReservations(partnerId: string): Promise<PartnerReservationView[]>;
  getReservation(partnerId: string, reservationId: string): Promise<PartnerReservationView | null>;
}
