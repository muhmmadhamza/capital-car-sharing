"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { CarImageView } from "@/components/cars/CarImageView";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormField";
import { CalendarIcon, ChevronLeftIcon, PinIcon } from "@/components/ui/Icons";
import { canCancel } from "@/features/reservations/status";
import { useReservation } from "@/hooks/useReservations";
import { formatDate, formatIsoDate, formatTime } from "@/lib/date";
import { cn, formatPrice } from "@/lib/utils";
import { cancelReservation } from "@/services/reservations";
import { errorMessage } from "@/services/errors";
import { StatusBadge } from "./StatusBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, Skeleton, panel } from "./States";

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn(panel, "p-5 sm:p-6", className)}>
      <h2 className="mb-4 text-base font-semibold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
      <dt className="text-navy-700">{label}</dt>
      <dd className={cn("text-right text-navy-900", strong ? "font-display text-lg font-semibold" : "font-medium")}>{children}</dd>
    </div>
  );
}

export function ReservationDetails({ id }: { id: string }) {
  const { customer } = useAuth();
  const { data: r, loading, error, reload, setData } = useReservation(id);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string>();

  const back = (
    <Link href="/customer/reservations" className="mb-5 inline-flex h-10 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-700">
      <ChevronLeftIcon width={16} height={16} /> My Reservations
    </Link>
  );

  if (error) {
    return (
      <div>
        {back}
        <ErrorBlock message={error} onRetry={reload} />
      </div>
    );
  }
  if (loading) {
    return (
      <div>
        {back}
        <Skeleton className="mb-4 h-10 w-2/3" />
        <LoadingBlock label="Loading reservation" rows={2} />
      </div>
    );
  }
  if (!r) {
    return (
      <div>
        {back}
        <EmptyBlock
          title="Reservation not found"
          text="It may have been removed, or it belongs to another account."
          action={<Button href="/customer/reservations">View my reservations</Button>}
        />
      </div>
    );
  }

  const name = `${r.car.make} ${r.car.model}`;

  async function onCancel() {
    if (!customer || !r) return;
    setCancelling(true);
    setCancelError(undefined);
    try {
      setData(await cancelReservation(r.id, customer.id));
      setConfirming(false);
    } catch (e) {
      setCancelError(errorMessage(e));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">Reservation {r.id.replace("res_", "#")}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{name}</h1>
        </div>
        <StatusBadge status={r.status} className="self-start" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <section className={cn(panel, "overflow-hidden")}>
            <div className="aspect-[16/8] max-h-72 w-full">
              <CarImageView car={r.car} image={r.car.images[0]} />
            </div>
            <div className="p-5 sm:p-6">
              <h2 className="text-base font-semibold text-navy-900">Car</h2>
              <p className="mt-1 text-sm text-muted">
                {r.car.year} · {r.car.category}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 divide-y-0 text-sm sm:grid-cols-4">
                {[
                  ["Seats", r.car.seats],
                  ["Transmission", r.car.transmission],
                  ["Fuel", r.car.fuel],
                  ["Mileage", `${r.car.mileagePerDay} km/day`],
                ].map(([label, value]) => (
                  <div key={label} className="py-2">
                    <dt className="text-xs font-medium text-muted">{label}</dt>
                    <dd className="font-medium text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/cars/${r.car.slug}`} className="mt-2 inline-block text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
                View car page
              </Link>
            </div>
          </section>

          <div className="grid gap-5 md:grid-cols-2">
            <Section title="Pickup">
              <p className="flex items-start gap-2 text-sm text-navy-900">
                <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                <span>
                  <span className="font-medium">{r.location.name}</span>
                  <br />
                  <span className="text-muted">
                    {r.location.address}, {r.location.city}
                  </span>
                </span>
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-navy-900">
                <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                {formatDate(r.pickupDate)} at {formatTime(r.pickupDate)}
              </p>
            </Section>
            <Section title="Return">
              <p className="flex items-start gap-2 text-sm text-navy-900">
                <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                <span>
                  <span className="font-medium">{r.location.name}</span>
                  <br />
                  <span className="text-muted">Same branch as pickup</span>
                </span>
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-navy-900">
                <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                {formatDate(r.returnDate)} at {formatTime(r.returnDate)}
              </p>
            </Section>
          </div>

          <Section title="Customer">
            <dl className="grid gap-x-6 text-sm sm:grid-cols-3">
              {[
                ["Name", customer?.name],
                ["Email", customer?.email],
                ["Phone", customer?.phone],
              ].map(([label, value]) => (
                <div key={label} className="py-1.5">
                  <dt className="text-xs font-medium text-muted">{label}</dt>
                  <dd className="break-words font-medium text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Price breakdown">
            <dl className="divide-y divide-navy-900/10">
              <Row label="Rental duration">
                {r.days} {r.days === 1 ? "day" : "days"}
              </Row>
              <Row label="Daily price">{formatPrice(r.dailyPrice)}</Row>
              <Row label={`${formatPrice(r.dailyPrice)} × ${r.days}`}>{formatPrice(r.totalPrice)}</Row>
              <Row label="Total" strong>
                {formatPrice(r.totalPrice)}
              </Row>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              A refundable security deposit of {formatPrice(r.car.depositAmount)} applies at pickup. Payments are not connected yet, so nothing has been charged.
            </p>
          </Section>

          <Section title="Status">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge status={r.status} />
              {r.status === "cancelled" && r.cancelledAt ? <span className="text-xs text-muted">on {formatIsoDate(r.cancelledAt)}</span> : null}
            </div>

            {canCancel(r) ? (
              <div className="mt-5">
                {cancelError ? <div className="mb-3"><FormAlert>{cancelError}</FormAlert></div> : null}
                {confirming ? (
                  <div role="alertdialog" aria-labelledby="cancel-title" className="rounded-xl border border-[#B3261E]/25 bg-[#FBEAE9] p-4">
                    <p id="cancel-title" className="text-sm font-semibold text-[#8E1D17]">
                      Cancel this reservation?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#8E1D17]/90">This cannot be undone. The car will be released for other customers.</p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row xl:flex-col">
                      <button
                        type="button"
                        onClick={onCancel}
                        disabled={cancelling}
                        className="inline-flex h-11 items-center justify-center rounded-lg bg-[#B3261E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8E1D17] disabled:opacity-60"
                      >
                        {cancelling ? "Cancelling…" : "Yes, cancel reservation"}
                      </button>
                      <Button variant="outline-navy" onClick={() => setConfirming(false)} disabled={cancelling}>
                        Keep reservation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#B3261E]/40 px-5 text-sm font-semibold text-[#8E1D17] transition-colors hover:bg-[#FBEAE9]"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  );
}
