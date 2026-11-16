import type { ReservationStatus, ReservationSummary, ReservationView } from "@/types/reservation";

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: "Pending approval",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const STATUS_ORDER: ReservationStatus[] = ["pending", "confirmed", "completed", "cancelled", "rejected"];

/** One line a customer can read under the status. */
export const STATUS_HINTS: Record<ReservationStatus, string> = {
  pending: "Waiting for the car owner to approve your request.",
  confirmed: "The owner approved your booking.",
  completed: "This trip is finished.",
  cancelled: "This booking was cancelled.",
  rejected: "The owner could not accept this booking.",
};

/** Holding statuses keep the car's dates blocked. */
export const isHolding = (s: ReservationStatus) => s === "pending" || s === "confirmed";

/**
 * Whether to offer the cancel button. The API decides (it knows the clock and the cancellation window) and sends
 * `canCancel`; the list endpoint does not, so fall back to the plain status rule. The API enforces it either way.
 */
export const canCancel = (r: Pick<ReservationView, "status" | "canCancel">) =>
  r.canCancel ?? isHolding(r.status);

export function summarize(reservations: Pick<ReservationView, "status">[]): ReservationSummary {
  const summary: ReservationSummary = { total: reservations.length, pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0 };
  for (const r of reservations) summary[r.status] += 1;
  return summary;
}

/**
 * What each role can do next with a booking. Mirrors the API's transition table so the screens only offer valid
 * actions; the API still checks every change (and the clock: it refuses to complete a booking before pickup).
 */
export interface StatusAction {
  to: ReservationStatus;
  label: string;
  /** A reason is required (rejecting, or an admin cancelling). */
  needsReason: boolean;
  danger?: boolean;
}

const A = {
  approve: { to: "confirmed", label: "Approve", needsReason: false },
  reject: { to: "rejected", label: "Reject", needsReason: true, danger: true },
  complete: { to: "completed", label: "Mark completed", needsReason: false },
  cancel: { to: "cancelled", label: "Cancel booking", needsReason: true, danger: true },
} as const satisfies Record<string, StatusAction>;

export function partnerActions(status: ReservationStatus): StatusAction[] {
  return status === "pending" ? [A.approve, A.reject] : status === "confirmed" ? [A.complete] : [];
}

export function adminActions(status: ReservationStatus): StatusAction[] {
  return status === "pending" ? [A.approve, A.reject, A.cancel] : status === "confirmed" ? [A.complete, A.cancel] : [];
}
