"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/customer/StatusBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, Skeleton, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, ChevronLeftIcon, MailIcon, PhoneIcon, PinIcon } from "@/components/ui/Icons";
import { usePartnerReservation } from "@/hooks/usePartnerData";
import { formatDate, formatTime } from "@/lib/date";
import { BODY_TYPE_LABELS } from "@/types/car";
import { cn, formatPrice } from "@/lib/utils";
import { PartnerCarImage, carName } from "./parts";

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

export function PartnerReservationDetails({ id }: { id: string }) {
  const { data: r, loading, error, reload } = usePartnerReservation(id);

  const back = (
    <Link href="/partner/reservations" className="mb-5 inline-flex h-10 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-700">
      <ChevronLeftIcon width={16} height={16} /> Reservations
    </Link>
  );

  if (error) return <div>{back}<ErrorBlock message={error} onRetry={reload} /></div>;
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
        <EmptyBlock title="Reservation not found" text="It may have been removed, or it belongs to another partner." action={<Button href="/partner/reservations">View reservations</Button>} />
      </div>
    );
  }

  return (
    <div>
      {back}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted">Reservation {r.id.replace("pres_", "#")}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{carName(r.car)}</h1>
        </div>
        <StatusBadge status={r.status} className="self-start" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <Section title="Customer">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium text-muted">Name</dt>
                <dd className="font-medium text-navy-900">{r.customer.name}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-muted">Email</dt>
                <dd className="flex items-center gap-1.5 break-all font-medium text-navy-900">
                  <MailIcon width={14} height={14} className="shrink-0 text-gold-700" />
                  <a href={`mailto:${r.customer.email}`} className="hover:text-gold-700">{r.customer.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted">Phone</dt>
                <dd className="flex items-center gap-1.5 font-medium text-navy-900">
                  <PhoneIcon width={14} height={14} className="shrink-0 text-gold-700" />
                  <a href={`tel:${r.customer.phone.replace(/\s/g, "")}`} className="hover:text-gold-700">{r.customer.phone}</a>
                </dd>
              </div>
            </dl>
          </Section>

          <section className={cn(panel, "overflow-hidden")}>
            <div className="grid sm:grid-cols-[14rem_1fr]">
              <div className="aspect-[16/10] w-full sm:aspect-auto sm:min-h-44">
                <PartnerCarImage car={r.car} />
              </div>
              <div className="p-5 sm:p-6">
                <h2 className="text-base font-semibold text-navy-900">Vehicle</h2>
                <p className="mt-2 text-lg font-semibold text-navy-900">{carName(r.car)}</p>
                <p className="text-sm text-muted">
                  {r.car.year} · {BODY_TYPE_LABELS[r.car.type]} · {r.car.transmission} · {r.car.fuelType}
                </p>
                <Link href={`/partner/cars/${r.car.id}`} className="mt-3 inline-block text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
                  View car
                </Link>
              </div>
            </div>
          </section>

          <Section title="Rental">
            <div className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted">Pickup location</p>
                <p className="mt-1 flex items-start gap-2 font-medium text-navy-900">
                  <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
                  <span className="break-words">{r.pickupLocation}</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Rental duration</p>
                <p className="mt-1 font-medium text-navy-900">
                  {r.days} {r.days === 1 ? "day" : "days"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Pickup</p>
                <p className="mt-1 flex items-center gap-2 font-medium text-navy-900">
                  <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                  {formatDate(r.pickupDate)} at {formatTime(r.pickupDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Return</p>
                <p className="mt-1 flex items-center gap-2 font-medium text-navy-900">
                  <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                  {formatDate(r.returnDate)} at {formatTime(r.returnDate)}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Pricing">
            <dl className="divide-y divide-navy-900/10">
              <Row label="Daily rate">{formatPrice(r.dailyPrice)}</Row>
              <Row label="Rental duration">
                {r.days} {r.days === 1 ? "day" : "days"}
              </Row>
              <Row label="Total amount" strong>
                {formatPrice(r.totalPrice)}
              </Row>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">Payments are not connected yet, so nothing has been charged or paid out.</p>
          </Section>

          <Section title="Status">
            <StatusBadge status={r.status} />
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {r.status === "upcoming"
                ? "The car is held for these dates and shows as booked on your calendar."
                : r.status === "active"
                  ? "The car is out on this rental right now."
                  : r.status === "completed"
                    ? "This rental has finished."
                    : "This reservation was cancelled, so the dates are free again."}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
