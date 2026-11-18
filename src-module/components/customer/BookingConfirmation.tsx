"use client";

import { useState } from "react";
import { CarImageView } from "@/components/cars/CarImageView";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, CheckIcon, PinIcon } from "@/components/ui/Icons";
import { useReservation } from "@/hooks/useReservations";
import { formatDateTime } from "@/lib/date";
import { cn, formatLocation } from "@/lib/utils";
import { PriceBreakdown } from "./PriceBreakdown";
import { EmptyBlock, ErrorBlock, LoadingBlock, panel } from "./States";

/** Shown right after a reservation is created. Reads the saved reservation back from the API, so it shows what was stored. */
export function BookingConfirmation({ id }: { id: string }) {
  const { data: r, loading, error, reload } = useReservation(id);
  const [copied, setCopied] = useState(false);

  if (loading) return <LoadingBlock label="Loading your booking…" />;
  if (error) return <ErrorBlock message={error} onRetry={reload} />;
  if (!r) {
    return (
      <EmptyBlock
        title="We couldn't find that booking"
        text="It may belong to a different account. Your bookings are listed under My Reservations."
        action={<Button href="/customer/reservations">My reservations</Button>}
      />
    );
  }

  const name = `${r.car.make} ${r.car.model}`;
  const reference = r.bookingReference ?? `#${r.id}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard can be blocked; the reference is on screen anyway */
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className={cn(panel, "overflow-hidden")}>
        <div className="h-1.5 bg-gold-500" />
        <div className="p-6 text-center sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-gold-500">
            <CheckIcon width={24} height={24} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
            {r.status === "confirmed" ? "Reservation confirmed" : r.status === "pending" ? "Request sent" : "Reservation received"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {r.status === "pending"
              ? `Your request for the ${name} is waiting for the car owner to approve it. The dates are held for you meanwhile. Keep your booking reference handy.`
              : `Your ${name} booking is ${r.status}. Keep your booking reference handy.`}
          </p>

          <div className="mx-auto mt-6 max-w-sm rounded-xl border border-gold-700/40 bg-gold-500/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Booking reference</p>
            <p className="mt-1 break-all font-mono text-xl font-semibold tracking-wider text-navy-900">{reference}</p>
            <button type="button" onClick={copy} className="mt-1 text-xs font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
              {copied ? "Copied" : "Copy reference"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 border-t border-navy-900/10 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <div className="aspect-[16/9] overflow-hidden rounded-xl">
              <CarImageView car={r.car} image={r.car.images[0]} />
            </div>
            <p className="mt-3 font-display text-lg font-semibold text-navy-900">{name}</p>
            <p className="text-sm text-muted">
              {r.car.year} · {r.car.category}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Pickup</dt>
                <dd className="mt-0.5 flex items-start gap-2 text-navy-900">
                  <CalendarIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                  {formatDateTime(r.pickupDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Return</dt>
                <dd className="mt-0.5 flex items-start gap-2 text-navy-900">
                  <CalendarIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                  {formatDateTime(r.returnDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted">Pickup and return location</dt>
                <dd className="mt-0.5 flex items-start gap-2 text-navy-900">
                  <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                  {formatLocation(r.location)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="mb-1 text-base font-semibold text-navy-900">Price breakdown</h2>
            <PriceBreakdown
              days={r.days}
              dailyPrice={r.dailyPrice}
              subtotal={r.pricing?.subtotal ?? r.totalPrice}
              serviceFee={r.pricing?.serviceFee ?? 0}
              tax={r.pricing?.tax ?? 0}
              total={r.totalPrice}
            />
            <p className="mt-3 text-xs leading-relaxed text-muted">Payments are not connected yet, so nothing has been charged.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-navy-900/10 p-6 sm:flex-row sm:justify-center sm:p-8">
          <Button href={`/customer/reservations/${r.id}`}>View booking details</Button>
          <Button href="/customer/reservations" variant="outline-navy">
            My reservations
          </Button>
          <Button href="/cars" variant="outline-navy">
            Browse more cars
          </Button>
        </div>
      </div>
    </div>
  );
}
