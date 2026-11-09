import type { ActivityStatus, ActivityType, AdminCar, AdminCarListStatus, AdminCarStatus, CarApprovalStatus, CustomerStatus, PartnerStatus } from "@/types/admin";
import type { ReservationStatus } from "@/types/reservation";

/** success = green, gold = needs attention, navy = neutral, danger = red. */
export type Tone = "success" | "gold" | "navy" | "danger";

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = { active: "Active", inactive: "Inactive" };
export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = { active: "Active", pending: "Pending", suspended: "Suspended" };
export const CAR_STATUS_LABELS: Record<AdminCarStatus, string> = { available: "Available", booked: "Booked", unavailable: "Unavailable" };
export const APPROVAL_LABELS: Record<CarApprovalStatus, string> = { pending: "Pending approval", approved: "Approved", rejected: "Rejected", suspended: "Suspended" };
export const CAR_LIST_STATUS_LABELS: Record<AdminCarListStatus, string> = {
  active: "Active",
  pending: "Pending approval",
  unavailable: "Unavailable",
  suspended: "Suspended",
  rejected: "Rejected",
};
export const RESERVATION_LABELS: Record<ReservationStatus, string> = { upcoming: "Upcoming", active: "Active", completed: "Completed", cancelled: "Cancelled" };

export const customerTone = (s: CustomerStatus): Tone => (s === "active" ? "success" : "navy");
export const partnerTone = (s: PartnerStatus): Tone => (s === "active" ? "success" : s === "pending" ? "gold" : "danger");
export const carTone = (s: AdminCarStatus): Tone => (s === "available" ? "success" : s === "booked" ? "navy" : "danger");
export const approvalTone = (s: CarApprovalStatus): Tone => (s === "approved" ? "success" : s === "pending" ? "gold" : "danger");
export const carListTone = (s: AdminCarListStatus): Tone => (s === "active" ? "success" : s === "pending" ? "gold" : s === "unavailable" ? "navy" : "danger");

/**
 * The one "Car status" an admin reads in lists and on the car page.
 * Approval wins: a car that is not approved is never Active. An approved car is Active
 * unless its owner has paused it (Unavailable). A car out on a rental still counts as Active.
 */
export function carListStatus(car: Pick<AdminCar, "approvalStatus" | "status">): AdminCarListStatus {
  if (car.approvalStatus === "pending") return "pending";
  if (car.approvalStatus === "rejected") return "rejected";
  if (car.approvalStatus === "suspended") return "suspended";
  return car.status === "unavailable" ? "unavailable" : "active";
}

/** Whether the car can be rented right now. Cars that are not approved are always unavailable. */
export function carAvailability(car: Pick<AdminCar, "approvalStatus" | "status">): AdminCarStatus {
  return car.approvalStatus === "approved" ? car.status : "unavailable";
}
export const reservationTone = (s: ReservationStatus): Tone =>
  s === "active" ? "success" : s === "upcoming" ? "navy" : s === "completed" ? "gold" : "danger";

/** Activity statuses come from four different vocabularies; this maps any of them. */
export function activityStatus(type: ActivityType, status: ActivityStatus): { label: string; tone: Tone } {
  switch (type) {
    case "customer_registered":
      return { label: CUSTOMER_STATUS_LABELS[status as CustomerStatus], tone: customerTone(status as CustomerStatus) };
    case "partner_registered":
      return { label: PARTNER_STATUS_LABELS[status as PartnerStatus], tone: partnerTone(status as PartnerStatus) };
    case "car_added":
      return { label: APPROVAL_LABELS[status as CarApprovalStatus], tone: approvalTone(status as CarApprovalStatus) };
    case "reservation_created":
      return { label: RESERVATION_LABELS[status as ReservationStatus], tone: reservationTone(status as ReservationStatus) };
  }
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  customer_registered: "New customer registration",
  partner_registered: "New partner registration",
  car_added: "New car added",
  reservation_created: "New reservation created",
};
