import { STATUS_LABELS } from "@/features/reservations/status";
import { formatIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { StatusHistoryEntry } from "@/types/reservation";

const ROLE_LABELS: Record<StatusHistoryEntry["changedByRole"], string> = {
  customer: "Customer",
  partner: "Car owner",
  admin: "Admin",
  system: "System",
};

const DOT: Record<StatusHistoryEntry["toStatus"], string> = {
  pending: "bg-gold-700",
  confirmed: "bg-[#1E6B45]",
  completed: "bg-navy-700",
  cancelled: "bg-[#B3261E]",
  rejected: "bg-[#B3261E]",
};

const time = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

/** Every status change of a booking, oldest first: what it became, who did it, when, and why. */
export function StatusHistory({ entries, className }: { entries: StatusHistoryEntry[] | undefined; className?: string }) {
  if (!entries || entries.length === 0) return <p className="text-sm text-muted">No status changes recorded.</p>;
  return (
    <ol className={cn("relative space-y-4 border-l border-navy-900/15 pl-5", className)}>
      {entries.map((e) => (
        <li key={e.id} className="relative">
          <span aria-hidden="true" className={cn("absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white", DOT[e.toStatus])} />
          <p className="text-sm font-semibold text-navy-900">
            {e.fromStatus ? `${STATUS_LABELS[e.fromStatus]} → ` : ""}
            {STATUS_LABELS[e.toStatus]}
          </p>
          <p className="text-xs text-muted">
            {ROLE_LABELS[e.changedByRole]}
            {e.changedByName ? ` · ${e.changedByName}` : ""} · {formatIsoDate(e.at)} {time(e.at)}
          </p>
          {e.reason ? <p className="mt-1 rounded-lg bg-navy-900/[0.04] px-3 py-2 text-sm text-navy-900">“{e.reason}”</p> : null}
        </li>
      ))}
    </ol>
  );
}
