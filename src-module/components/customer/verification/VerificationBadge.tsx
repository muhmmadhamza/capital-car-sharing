import { VERIFICATION_LABELS } from "@/features/verification/status";
import { cn } from "@/lib/utils";
import type { VerificationStatus } from "@/types/verification";

/** Same pill shape and palette as the reservation StatusBadge. */
const styles: Record<VerificationStatus, string> = {
  not_submitted: "border-navy-700/25 bg-navy-900/[0.06] text-navy-900",
  pending_review: "border-gold-700/30 bg-gold-500/15 text-navy-900",
  approved: "border-[#1E6B45]/25 bg-[#E7F4EC] text-[#14543A]",
  rejected: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
  resubmission_required: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
};

const dots: Record<VerificationStatus, string> = {
  not_submitted: "bg-navy-700",
  pending_review: "bg-gold-700",
  approved: "bg-[#1E6B45]",
  rejected: "bg-[#B3261E]",
  resubmission_required: "bg-[#B3261E]",
};

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-snug", styles[status], className)}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {VERIFICATION_LABELS[status]}
    </span>
  );
}
