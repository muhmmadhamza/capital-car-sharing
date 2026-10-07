import { STATUS_LABELS } from "@/features/reservations/status";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/reservation";

/** Same pill shape and palette as AvailabilityBadge, so statuses look alike everywhere. */
const styles: Record<ReservationStatus, string> = {
  upcoming: "border-navy-700/25 bg-navy-900/[0.06] text-navy-900",
  active: "border-[#1E6B45]/25 bg-[#E7F4EC] text-[#14543A]",
  completed: "border-gold-700/30 bg-gold-500/15 text-navy-900",
  cancelled: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
};

const dots: Record<ReservationStatus, string> = {
  upcoming: "bg-navy-700",
  active: "bg-[#1E6B45]",
  completed: "bg-gold-700",
  cancelled: "bg-[#B3261E]",
};

export function StatusBadge({ status, className }: { status: ReservationStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-snug", styles[status], className)}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
