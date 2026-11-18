import { ClockIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import type { BookingType } from "@/types/booking";

/**
 * Marks an advance reservation (booked well ahead of pickup). Renders nothing for a standard booking, so it can be
 * dropped next to any StatusBadge. Navy with a gold clock keeps it distinct from the status colours.
 */
export function AdvanceBadge({ bookingType, className }: { bookingType?: BookingType; className?: string }) {
  if (bookingType !== "advance") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-navy-900 bg-navy-900 px-3 py-1 text-xs font-semibold leading-snug text-white",
        className,
      )}
    >
      <ClockIcon width={13} height={13} className="text-gold-400" aria-hidden="true" />
      Advance
    </span>
  );
}
