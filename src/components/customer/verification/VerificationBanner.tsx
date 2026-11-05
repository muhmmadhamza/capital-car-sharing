"use client";

import Link from "next/link";
import { ArrowRightIcon, ShieldIcon } from "@/components/ui/Icons";
import { useAsync } from "@/hooks/useAsync";
import { verificationService } from "@/services/verification";
import { cn } from "@/lib/utils";
import { panel } from "../States";
import { VerificationBadge } from "./VerificationBadge";

/**
 * Dashboard reminder. Shown only when there is something to do or wait for; it stays out of the way while
 * loading, on errors, and once the customer is approved. The server still enforces verification on bookings.
 */
export function VerificationBanner() {
  const { data } = useAsync(() => verificationService.get(), []);
  const v = data?.verification;
  if (!v || v.status === "approved") return null;

  const copy = {
    not_submitted: "Verify your identity to reserve cars. It only takes a few minutes.",
    pending_review: "We're reviewing your documents. We'll email you when there's a decision.",
    rejected: "We couldn't approve your verification. See why and submit again.",
    resubmission_required: "We need a little more information to approve your verification.",
  }[v.status];
  const action = v.status === "pending_review" ? "View status" : v.status === "not_submitted" ? "Start verification" : "Update and resubmit";

  return (
    <section aria-label="Identity verification" className={cn(panel, "flex flex-col gap-4 border-gold-700/30 p-5 sm:flex-row sm:items-center sm:justify-between")}>
      <div className="flex items-start gap-3">
        <ShieldIcon width={24} height={24} className="mt-0.5 shrink-0 text-gold-700" />
        <div>
          <p className="flex flex-wrap items-center gap-2 font-semibold text-navy-900">
            Identity verification <VerificationBadge status={v.status} />
          </p>
          <p className="mt-1 text-sm text-navy-700">{copy}</p>
        </div>
      </div>
      <Link href="/customer/verification" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700">
        {action} <ArrowRightIcon width={16} height={16} />
      </Link>
    </section>
  );
}
