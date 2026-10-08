import type { DateKey, WallClock } from "./booking";
import type { CarBodyType, CarImage, FuelType, Transmission } from "./car";
import type { ReservationStatus } from "./reservation";

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
  /** Image URL (or data URL in mock mode). Empty or missing shows initials. */
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
 */
export type PartnerCarStatus = "available" | "booked" | "unavailable" | "pending";

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
  /** State of today's date on the car's calendar. */
  today: CarDayStatus;
  /** Soonest upcoming or active reservation, when there is one. */
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
  /** Price per day at the time of booking. */
  dailyPrice: number;
  /** dailyPrice × billable days. */
  totalPrice: number;
}

/** The only customer details a partner is allowed to see on a reservation. */
export interface ReservationCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface PartnerReservationView extends PartnerReservation {
  customer: ReservationCustomer;
  car: PartnerCar;
  days: number;
}

export interface PartnerStats {
  totalCars: number;
  availableCars: number;
  bookedCars: number;
  upcomingReservations: number;
  totalReservations: number;
}
