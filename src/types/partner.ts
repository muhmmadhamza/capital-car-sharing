import type { BookingType, DateKey, WallClock } from "./booking";
import type { CarBodyType, CarImage, FuelType, Transmission } from "./car";
import type { ReservationStatus, StatusHistoryEntry } from "./reservation";

/**
 * A partner (car owner or fleet company). Matches the `partners` table; the
 * password hash and other server-only columns are never sent to the browser.
 */
export interface Partner {
  id: string;
  /** Contact person. */
  name: string;
  /** Business or fleet name. Empty for private owners. */
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  /** Image URL. Empty or missing shows initials. */
  avatar?: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface PartnerLoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export interface PartnerRegisterInput {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface PartnerProfileUpdate {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  /** `null` removes the avatar. `undefined` leaves it unchanged. */
  avatar?: string | null;
}

/**
 * - available:   open for rent
 * - booked:      out on a rental right now (derived from reservations, never set by hand)
 * - unavailable: the owner has paused the listing
 * - pending:     waiting for Capital Car Sharing to verify the car
 * - rejected / suspended: the platform did not approve the car, or paused it
 */
export type PartnerCarStatus = "available" | "booked" | "unavailable" | "pending" | "rejected" | "suspended";

/** Matches the `partner_cars` table. */
export interface PartnerCar {
  id: string;
  partnerId: string;
  make: string;
  model: string;
  year: number;
  type: CarBodyType;
  seats: number;
  doors: number;
  transmission: Transmission;
  fuelType: FuelType;
  dailyPrice: number;
  /** Where renters collect the car. Free text for now. */
  location: string;
  description: string;
  images: CarImage[];
  features: string[];
  /** As stored. "booked" is never stored; see PartnerCarView.status. */
  status: PartnerCarStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Fields the Add Car and Edit Car forms submit. */
export type PartnerCarInput = Omit<PartnerCar, "id" | "partnerId" | "status" | "createdAt">;

/** What the screens read: the stored car plus what is true right now. */
export interface PartnerCarView extends PartnerCar {
  /** Status including "booked" while a reservation is active. */
  status: PartnerCarStatus;
  /** What is stored, without the derived "booked". Edit forms use this one. */
  listingStatus: PartnerCarStatus;
  /**
   * State of today's date on the car's calendar, read from the same availability data as the calendar.
   * `undefined` means it could not be loaded: screens must say so, never fall back to "unavailable".
   * Unrelated to `status`: a pending car can be available today and is still pending.
   */
  today?: CarDayStatus;
  /** The date `today` refers to, as the server calculated it (business time zone). */
  todayDate?: DateKey;
  /** Soonest confirmed reservation, when there is one. */
  nextReservationAt?: WallClock;
}

/** State of one calendar day. "booked" is read-only. */
export type CarDayStatus = "available" | "unavailable" | "booked";

/** Matches the `car_availability` table: one row per car per day. */
export interface Availability {
  id: string;
  carId: string;
  date: DateKey;
  status: CarDayStatus;
}

/** Matches the `reservations` table, from the partner's side. */
export interface PartnerReservation {
  id: string;
  customerId: string;
  partnerId: string;
  carId: string;
  /** Pickup place as text. Cars are returned to the same place. */
  pickupLocation: string;
  pickupDate: WallClock;
  returnDate: WallClock;
  status: ReservationStatus;
  /** "advance" when booked at least the minimum lead time ahead of pickup. */
  bookingType: BookingType;
  /** Price per day at the time of booking. */
  dailyPrice: number;
  /** dailyPrice × billable days. */
  totalPrice: number;
  /** Unique reference, e.g. "CCS-261108-K7M2X". */
  bookingReference?: string;
  /** Why the booking was rejected or cancelled. */
  statusReason?: string;
  /** ISO 8601. When the request was made. */
  createdAt?: string;
}

/** The only customer details a partner is allowed to see on a reservation. */
export interface ReservationCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/** What a reservation tells a partner about the car. The reservation endpoints send these fields only. */
export type ReservationCar = Pick<PartnerCar, "id" | "make" | "model" | "year" | "type" | "images" | "location">;

export interface PartnerReservationView extends PartnerReservation {
  customer: ReservationCustomer;
  car: ReservationCar;
  days: number;
  /** Price breakdown as stored at booking time. */
  pricing?: { subtotal: number; serviceFee: number; tax: number; total: number };
  /** Status changes, oldest first. Only on the details call. */
  history?: StatusHistoryEntry[];
}

/** Filters the partner's reservation list understands. The API applies them. */
export interface PartnerReservationFilters {
  status?: ReservationStatus;
  carId?: string;
  /** Booking reference, customer name or email, car make or model. */
  search?: string;
  /** The API applies it. */
  bookingType?: BookingType;
}

export interface PartnerStats {
  totalCars: number;
  availableCars: number;
  /** Cars whose calendar shows today as booked. */
  bookedCars: number;
  /** Requests waiting for the partner's decision. */
  pendingReservations: number;
  /** Confirmed bookings that have not ended yet. */
  upcomingReservations: number;
  totalReservations: number;
  /** Advance reservations still ahead (pending or confirmed, pickup not passed). Undefined on an older API. */
  upcomingAdvanceReservations?: number;
  /** Of those, how many have a pickup within the next 7 days. */
  advanceNext7Days?: number;
}
