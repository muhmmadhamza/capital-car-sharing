import type { AvailabilityResult } from "@/types/booking";
import { formatDateTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { AlertIcon, CheckIcon, ClockIcon } from "@/components/ui/Icons";

/** Status colours live here only, so the three states look the same on every page. */
const styles = {
  available: "border-[#1E6B45]/25 bg-[#E7F4EC] text-[#14543A]",
  booked: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
  available_from: "border-gold-700/30 bg-gold-500/15 text-navy-900",
} as const;

export function availabilityLabel(a: AvailabilityResult, hasWindow: boolean): string {
  if (a.status === "available") return hasWindow ? "Available for your dates" : "Available";
  if (a.status === "booked") return hasWindow ? "Already booked for your dates" : "Already booked";
  return a.availableFrom ? `Available from ${formatDateTime(a.availableFrom)}` : "Available later";
}

export function AvailabilityBadge({
  availability,
  hasWindow = false,
  className,
}: {
  availability: AvailabilityResult;
  hasWindow?: boolean;
  className?: string;
}) {
  const Icon = availability.status === "available" ? CheckIcon : availability.status === "booked" ? AlertIcon : ClockIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-snug",
        styles[availability.status],
        className,
      )}
    >
      <Icon width={14} height={14} className="shrink-0" />
      {availabilityLabel(availability, hasWindow)}
    </span>
  );
}
