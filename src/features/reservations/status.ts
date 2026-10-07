import type { ReservationStatus, ReservationSummary, ReservationView } from "@/types/reservation";

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  upcoming: "Upcoming",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_ORDER: ReservationStatus[] = ["upcoming", "active", "completed", "cancelled"];

/** Only upcoming reservations can be cancelled (the API enforces this too). */
export const canCancel = (r: Pick<ReservationView, "status">) => r.status === "upcoming";

export function summarize(reservations: Pick<ReservationView, "status">[]): ReservationSummary {
  const summary: ReservationSummary = { total: reservations.length, upcoming: 0, active: 0, completed: 0, cancelled: 0 };
  for (const r of reservations) summary[r.status] += 1;
  return summary;
}
