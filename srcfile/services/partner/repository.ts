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
 * and reservations. The UI only calls src/services/partner.
 *
 * Every call is scoped to the signed-in partner by the session token; the
 * `partnerId` arguments are kept so screens can tell which partner a result
 * belongs to, and the API ignores anything the browser sends as an id.
 *
 * Implemented by ./api-repository.ts on top of src/services/api/partner.service.ts:
 *   GET    /partners/me/cars                 POST /partners/me/cars
 *   GET    /partners/me/cars/:id             PUT  /partners/me/cars/:id
 *   DELETE /partners/me/cars/:id
 *   POST   /partners/me/cars/:id/images   (photo for an existing car)    POST /partners/me/car-images   (new car)
 *   GET    /partners/me/cars/:id/availability?startDate=&endDate=   (calendar of an own car, published or not)
 *   PUT    /partners/me/cars/:id/availability   { dates, status }   (409 when a day is booked)
 *
 * Not offered by the backend yet. These report "unavailable" (or show a dash) instead of inventing data:
 *   - the partner's reservations, and the reservation figures on the dashboard
 */
export interface PartnerDataRepository {
  getStats(partnerId: string): Promise<PartnerStats>;

  listCars(partnerId: string): Promise<PartnerCarView[]>;
  getCar(partnerId: string, carId: string): Promise<PartnerCarView | null>;
  createCar(partnerId: string, input: PartnerCarInput): Promise<PartnerCarView>;
  updateCar(partnerId: string, carId: string, input: PartnerCarInput, listingStatus?: PartnerCarStatus): Promise<PartnerCarView>;
  deleteCar(partnerId: string, carId: string): Promise<void>;
  /**
   * Uploads a photo and returns its URL. Pass `carId` when the car already exists so the photo is saved
   * to it immediately; otherwise the URL is saved with the car by createCar. `onProgress` gets 0-100.
   */
  uploadCarImage(file: File, opts?: { carId?: string; onProgress?: (percent: number) => void }): Promise<string>;

  /** One row per day of the month, with "booked" days included and read-only. */
  getAvailability(partnerId: string, carId: string, month: DateKey): Promise<Availability[]>;
  /** Marks days available or unavailable. Rejects the whole request if any day is booked. */
  setAvailability(partnerId: string, carId: string, dates: DateKey[], status: "available" | "unavailable"): Promise<void>;

  listReservations(partnerId: string): Promise<PartnerReservationView[]>;
  getReservation(partnerId: string, reservationId: string): Promise<PartnerReservationView | null>;
}
