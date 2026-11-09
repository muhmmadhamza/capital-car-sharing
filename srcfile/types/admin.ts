import type { WallClock } from "./booking";
import type { CarBodyType } from "./car";
import type { ReservationStatus } from "./reservation";

/**
 * Types for the ADMIN module. Customers, partners, cars and reservations are
 * named Admin* because src/types/{customer,partner,car,reservation}.ts already
 * describe the same records from the customer and partner side. Keeping them
 * separate means the admin module never changes what those areas can see.
 *
 * They mirror the future PostgreSQL tables (`admins`, `customers`, `partners`,
 * `partner_cars`, `reservations`). Password hashes never reach the browser.
 */

// ---------------------------------------------------------------- admin account

export type AdminRole = "super_admin" | "admin" | "support";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface AdminLoginInput {
  email: string;
  password: string;
  /** Keep the session after the browser closes. */
  remember: boolean;
}

// -------------------------------------------------------------------- customers

export type CustomerStatus = "active" | "inactive";

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Fields an admin may change on a customer (status has its own call). */
export interface AdminCustomerUpdate {
  name: string;
  email: string;
  phone: string;
}

// --------------------------------------------------------------------- partners

export type PartnerStatus = "active" | "pending" | "suspended";

export interface AdminPartner {
  id: string;
  /** Contact person. */
  name: string;
  companyName: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

// ------------------------------------------------------------------------- cars

/** What the car is doing: open for rent, out on a rental, or paused by the owner. */
export type AdminCarStatus = "available" | "booked" | "unavailable";

/**
 * Whether Capital Car Sharing allows the listing on the platform.
 *
 *   pending   -> approved   (Approve)
 *   pending   -> rejected   (Reject)
 *   rejected  -> approved   (Approve again after a re-review)
 *   approved  -> suspended  (Suspend)
 *   suspended -> approved   (Activate)
 */
export type CarApprovalStatus = "pending" | "approved" | "rejected" | "suspended";

/** What an admin sees as the car's single "Car status", derived from approval + availability. */
export type AdminCarListStatus = "active" | "pending" | "unavailable" | "suspended" | "rejected";

/** A pickup branch. Cars and reservations point at one. */
export interface AdminLocation {
  id: string;
  name: string;
}

export interface AdminCar {
  id: string;
  partnerId: string;
  make: string;
  model: string;
  year: number;
  /** Car type: sedan, SUV, hatchback or coupe. */
  bodyType: CarBodyType;
  /** Pickup branch, see AdminLocation. */
  locationId: string;
  /** Paint colour for the placeholder illustration until real photos exist. */
  paint: string;
  /** Optional photo. Leave empty to show the placeholder illustration. */
  imageSrc?: string;
  dailyPrice: number;
  status: AdminCarStatus;
  approvalStatus: CarApprovalStatus;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** Fields an admin may change on a car (approval status has its own calls). */
export interface AdminCarUpdate {
  make: string;
  model: string;
  year: number;
  bodyType: CarBodyType;
  locationId: string;
  dailyPrice: number;
  /** Owner-controlled availability. "booked" is derived from reservations and cannot be set. */
  status: Exclude<AdminCarStatus, "booked">;
}

// ----------------------------------------------------------------- reservations

export interface AdminReservation {
  id: string;
  customerId: string;
  partnerId: string;
  carId: string;
  pickupLocation: string;
  pickupDate: WallClock;
  returnDate: WallClock;
  /** Same lifecycle as the customer and partner areas. */
  status: ReservationStatus;
  /** Price per day at the time of booking. Later price changes never alter it. */
  dailyPrice: number;
  totalPrice: number;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

// ------------------------------------------------------------------------ views

/** A reservation joined with the names an admin list needs. */
export interface AdminReservationView extends AdminReservation {
  customerName: string;
  partnerName: string;
  carName: string;
}

/** A car joined with its owner and how often it has been booked. */
export interface AdminCarView extends AdminCar {
  partnerName: string;
  /** Resolved from locationId. */
  locationName: string;
  reservationCount: number;
}

/** One car with its owner and booking history, for /admin/cars/:id. */
export interface AdminCarDetail extends AdminCarView {
  partner: AdminPartner;
  reservations: AdminReservationView[];
}

/** One reservation with every related record resolved, for /admin/reservations/:id. */
export interface AdminReservationDetail extends AdminReservationView {
  customer: AdminCustomer;
  partner: AdminPartner;
  car: AdminCar;
  /** Resolved from car.locationId. */
  carLocationName: string;
  /** Billable days, same rule as the customer and partner areas. */
  days: number;
}

export interface AdminCustomerRow extends AdminCustomer {
  reservationCount: number;
}

export interface AdminCustomerDetail extends AdminCustomerRow {
  reservations: AdminReservationView[];
}

export interface AdminPartnerRow extends AdminPartner {
  carCount: number;
  reservationCount: number;
}

export interface AdminPartnerDetail extends AdminPartnerRow {
  cars: AdminCarView[];
  reservations: AdminReservationView[];
}

// --------------------------------------------------------------------- settings

/** Platform-wide settings. Matches the future `platform_settings` table (one row). */
export interface AdminSettings {
  platformName: string;
  contactEmail: string;
  contactPhone: string;
  /** ISO 4217 code. */
  currency: string;
  /** Suggested daily price when a partner lists a new car. */
  defaultDailyRate: number;
  minRentalDays: number;
  maxRentalDays: number;
}

// -------------------------------------------------------------------- dashboard

export interface AdminStats {
  totalCustomers: number;
  totalPartners: number;
  totalCars: number;
  availableCars: number;
  bookedCars: number;
  totalReservations: number;
  upcomingReservations: number;
  completedReservations: number;
}

/** Counts that need an admin's attention. */
export interface AdminAttention {
  pendingPartners: number;
  pendingCars: number;
  inactiveCustomers: number;
}

export type ActivityType = "customer_registered" | "partner_registered" | "car_added" | "reservation_created";

export type ActivityStatus = CustomerStatus | PartnerStatus | CarApprovalStatus | ReservationStatus;

export interface AdminActivity {
  id: string;
  type: ActivityType;
  /** Who or what it is about: a person, a company, a car or a reservation. */
  name: string;
  /** One line of context, e.g. the owner of a new car. */
  detail: string;
  /** ISO 8601 timestamp. */
  occurredAt: string;
  /** Current status of the record the activity is about. */
  status: ActivityStatus;
  /** Where the admin can open the record, when a page for it exists. */
  href?: string;
}

export interface AdminDashboard {
  stats: AdminStats;
  attention: AdminAttention;
  activity: AdminActivity[];
}
