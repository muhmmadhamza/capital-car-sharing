"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ReserveAuthPrompt } from "@/components/auth/ReserveAuthPrompt";
import { AdvanceBadge } from "@/components/customer/AdvanceBadge";
import { PriceBreakdown } from "@/components/customer/PriceBreakdown";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CalendarIcon, CheckIcon, PinIcon, ShieldIcon } from "@/components/ui/Icons";
import { useAsync } from "@/hooks/useAsync";
import { combine, formatDate, formatTimeKey, rentalDays } from "@/lib/date";
import { formatMoney } from "@/lib/utils";
import { errorMessage, isServiceError } from "@/services/errors";
import { createBooking, quoteBooking, type BookingRequest } from "@/services/reservations";

export interface CheckoutCar {
  id: string;
  name: string;
  /** "Compact sedan, 2022" */
  subtitle: string;
  locationName: string;
  pricePerDay: number;
}

interface Props {
  car: CheckoutCar;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  /** Where to come back to after logging in. */
  returnTo: string;
}

function Moment({ label, date, time, place, note }: { label: string; date: string; time: string; place: string; note?: string }) {
  return (
    <div className="rounded-xl border border-navy-900/10 bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1.5 flex items-center gap-2 font-semibold text-navy-900">
        <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
        {formatDate(date)} at {formatTimeKey(time)}
      </p>
      <p className="mt-1.5 flex items-start gap-2 text-sm text-navy-700">
        <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
        <span>
          {place}
          {note ? <span className="text-muted"> · {note}</span> : null}
        </span>
      </p>
    </div>
  );
}

function Summary({ car, p }: { car: CheckoutCar; p: Props }) {
  return (
    <>
      <p className="text-sm text-muted">{car.subtitle}</p>
      <h2 className="text-2xl font-semibold text-navy-900">{car.name}</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Moment label="Pickup" date={p.pickupDate} time={p.pickupTime} place={car.locationName} />
        <Moment label="Return" date={p.returnDate} time={p.returnTime} place={car.locationName} note="same branch" />
      </div>
    </>
  );
}

/**
 * The reserve step. Anonymous visitors see an estimate and are invited to log in. Signed-in customers get the
 * server's quote (real availability and price), review it, and confirm.
 *
 * Nothing here decides anything: the server re-checks verification, availability and price when the reservation
 * is created, and this screen only reports what it said.
 */
export function CheckoutPanel(props: Props) {
  const { status } = useAuth();
  if (status === "loading") {
    return <div role="status" aria-live="polite" className="mt-6 h-40 animate-pulse rounded-xl bg-navy-900/[0.07]"><span className="sr-only">Checking your session…</span></div>;
  }
  if (status !== "authenticated") return <GuestCheckout {...props} />;
  return <MemberCheckout {...props} />;
}

function GuestCheckout(p: Props) {
  const { car } = p;
  const days = rentalDays(combine(p.pickupDate, p.pickupTime), combine(p.returnDate, p.returnTime));
  return (
    <div className="mt-6">
      <Summary car={car} p={p} />
      <p className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-navy-900/10 px-4 py-3 text-sm">
        <span className="text-navy-700">
          Estimate: {formatMoney(car.pricePerDay)} × {days} {days === 1 ? "day" : "days"}
        </span>
        <span className="font-display text-lg font-semibold text-navy-900">{formatMoney(car.pricePerDay * days)}</span>
      </p>
      <ReserveAuthPrompt returnTo={p.returnTo} />
    </div>
  );
}

function MemberCheckout(p: Props) {
  const { car } = p;
  const router = useRouter();
  const request: BookingRequest = useMemo(
    () => ({ carId: car.id, pickupDate: p.pickupDate, pickupTime: p.pickupTime, returnDate: p.returnDate, returnTime: p.returnTime }),
    [car.id, p.pickupDate, p.pickupTime, p.returnDate, p.returnTime],
  );
  const { data: quote, loading, error, reload } = useAsync(() => quoteBooking(request), [request]);

  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<{ message: string; blocked: boolean; verificationStatus?: string }>();

  async function onConfirm() {
    if (submitting) return; // a double click must never send two requests
    setSubmitting(true);
    setFailure(undefined);
    try {
      const reservation = await createBooking(request);
      // Stay in the submitting state while the confirmation page loads.
      router.push(`/customer/reservations/${reservation.id}/confirmation`);
    } catch (e) {
      const blocked = isServiceError(e) && e.code === "verification_required";
      setFailure({ message: errorMessage(e), blocked, verificationStatus: isServiceError(e) ? e.verificationStatus : undefined });
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="mt-6 space-y-3">
        <span className="sr-only">Checking availability and price…</span>
        <div className="h-24 animate-pulse rounded-xl bg-navy-900/[0.07]" />
        <div className="h-40 animate-pulse rounded-xl bg-navy-900/[0.07]" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="mt-6">
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-4 py-3 text-sm text-[#8E1D17]">
          <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
          {error ?? "We could not check these dates."}
        </p>
        <Button variant="outline-navy" onClick={reload} className="mt-3">
          Try again
        </Button>
      </div>
    );
  }

  const { pricing, eligibility } = quote;
  // The quote says whether this customer may book; a refused confirmation can also say so (status changed meanwhile).
  const blockedMessage = failure?.blocked ? failure.message : eligibility.canBook ? null : eligibility.message;
  const canConfirm = eligibility.canBook && !failure?.blocked;

  return (
    <div className="mt-6">
      <p className="flex items-center gap-2 font-semibold text-[#14543A]">
        <CheckIcon width={18} height={18} /> These dates are available.
      </p>
      {quote.bookingType === "advance" ? (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-navy-700">
          <AdvanceBadge bookingType="advance" />
          {quote.leadHours !== undefined && quote.leadHours >= 48
            ? `Advance reservation: pickup is about ${Math.floor(quote.leadHours / 24)} days away. The car is held for you once you send the request.`
            : "Advance reservation: the car is held for you once you send the request."}
        </p>
      ) : null}
      <div className="mt-4">
        <Summary car={car} p={p} />
      </div>

      <h3 className="mb-1 mt-6 text-base font-semibold text-navy-900">Price breakdown</h3>
      <PriceBreakdown
        days={pricing.rentalDays}
        dailyPrice={pricing.dailyPrice}
        subtotal={pricing.subtotal}
        serviceFee={pricing.serviceFee}
        tax={pricing.tax}
        total={pricing.total}
        className="border-y border-navy-900/10"
      />

      {blockedMessage ? (
        <div role="alert" className="mt-5 rounded-xl border border-gold-700/40 bg-gold-500/15 p-4">
          <p className="flex items-start gap-2 text-sm font-semibold text-navy-900">
            <ShieldIcon width={18} height={18} className="mt-0.5 shrink-0 text-gold-700" />
            You can't book yet
          </p>
          <p className="mt-1 text-sm text-navy-800">{blockedMessage}</p>
          <Button href="/customer/verification" variant="navy" className="mt-3">
            Go to verification
          </Button>
        </div>
      ) : null}

      {failure && !failure.blocked ? (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-4 py-3 text-sm text-[#8E1D17]">
          <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
          {failure.message}
        </p>
      ) : null}

      <Button size="lg" className="mt-5 w-full" onClick={onConfirm} disabled={!canConfirm || submitting} aria-busy={submitting}>
        {submitting ? "Sending…" : "Request reservation"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        {canConfirm ? "No payment is taken. The car owner approves your request; you get a booking reference right away and can follow the status in My Reservations." : "Confirmation unlocks once your identity is verified."}
      </p>
    </div>
  );
}
