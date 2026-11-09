import { dateOf } from "@/lib/date";
import type { AdminCarListStatus, AdminCarView, AdminCustomerRow, AdminPartnerRow, AdminReservationView, CustomerStatus, PartnerStatus } from "@/types/admin";
import type { ReservationStatus } from "@/types/reservation";
import { carListStatus } from "./status";

const norm = (v: string) => v.trim().toLowerCase();

/** Phone numbers match with or without spaces and punctuation. */
const digits = (v: string) => v.replace(/\D/g, "");

function matches(query: string, fields: string[]): boolean {
  const q = norm(query);
  if (!q) return true;
  const qDigits = digits(q);
  return fields.some((f) => norm(f).includes(q) || (qDigits.length >= 3 && digits(f).includes(qDigits)));
}

export function filterCustomers(rows: AdminCustomerRow[], query: string, status: CustomerStatus | "all"): AdminCustomerRow[] {
  return rows.filter((c) => (status === "all" || c.status === status) && matches(query, [c.name, c.email, c.phone]));
}

export function filterPartners(rows: AdminPartnerRow[], query: string, status: PartnerStatus | "all"): AdminPartnerRow[] {
  return rows.filter((p) => (status === "all" || p.status === status) && matches(query, [p.name, p.companyName, p.email, p.phone]));
}

export const PAGE_SIZE = 10;

// ------------------------------------------------------------------------ cars

export interface CarFilters {
  query: string;
  /** "all" or a CarBodyType. */
  bodyType: string;
  /** "all" or a partner id. */
  partnerId: string;
  status: AdminCarListStatus | "all";
  /** "all" or a location id. */
  locationId: string;
}

export const NO_CAR_FILTERS: CarFilters = { query: "", bodyType: "all", partnerId: "all", status: "all", locationId: "all" };

export const carFiltersActive = (f: CarFilters) =>
  f.query.trim() !== "" || f.bodyType !== "all" || f.partnerId !== "all" || f.status !== "all" || f.locationId !== "all";

export function filterCars(rows: AdminCarView[], f: CarFilters): AdminCarView[] {
  return rows.filter(
    (c) =>
      (f.bodyType === "all" || c.bodyType === f.bodyType) &&
      (f.partnerId === "all" || c.partnerId === f.partnerId) &&
      (f.locationId === "all" || c.locationId === f.locationId) &&
      (f.status === "all" || carListStatus(c) === f.status) &&
      matches(f.query, [c.make, c.model, `${c.make} ${c.model}`, String(c.year), c.partnerName, c.locationName, c.id]),
  );
}

// --------------------------------------------------------------- reservations

export interface ReservationFilters {
  query: string;
  status: ReservationStatus | "all";
  /** "all" or a customer id. */
  customerId: string;
  /** "all" or a partner id. */
  partnerId: string;
  /** "all" or a car id. */
  carId: string;
  /** "YYYY-MM-DD" or "". Reservations whose rental period reaches this day or later. */
  dateFrom: string;
  /** "YYYY-MM-DD" or "". Reservations whose rental period starts on or before this day. */
  dateTo: string;
}

export const NO_RESERVATION_FILTERS: ReservationFilters = { query: "", status: "all", customerId: "all", partnerId: "all", carId: "all", dateFrom: "", dateTo: "" };

export const reservationFiltersActive = (f: ReservationFilters) =>
  f.query.trim() !== "" || f.status !== "all" || f.customerId !== "all" || f.partnerId !== "all" || f.carId !== "all" || f.dateFrom !== "" || f.dateTo !== "";

/**
 * Date filter: a reservation matches when its rental period overlaps the chosen range.
 * With only "from" it means "still running on or after that day"; with only "to",
 * "started on or before that day"; with both set to one day, "on the road that day".
 */
export function filterReservations(rows: AdminReservationView[], f: ReservationFilters): AdminReservationView[] {
  return rows.filter(
    (r) =>
      (f.status === "all" || r.status === f.status) &&
      (f.customerId === "all" || r.customerId === f.customerId) &&
      (f.partnerId === "all" || r.partnerId === f.partnerId) &&
      (f.carId === "all" || r.carId === f.carId) &&
      (!f.dateFrom || dateOf(r.returnDate) >= f.dateFrom) &&
      (!f.dateTo || dateOf(r.pickupDate) <= f.dateTo) &&
      matches(f.query, [r.id, r.customerName, r.carName, r.partnerName, r.pickupLocation]),
  );
}
