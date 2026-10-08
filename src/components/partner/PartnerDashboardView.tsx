"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, PlusIcon } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/customer/StatusBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, panel } from "@/components/customer/States";
import { usePartnerCars, usePartnerReservations, usePartnerStats } from "@/hooks/usePartnerData";
import { formatDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { usePartnerAuth } from "./PartnerAuthProvider";
import { CarStatusBadge, PartnerCarImage, StatCard, carName } from "./parts";

export function PartnerDashboardView() {
  const { partner } = usePartnerAuth();
  const stats = usePartnerStats();
  const cars = usePartnerCars();
  const reservations = usePartnerReservations();

  const upcoming = useMemo(
    () =>
      (reservations.data ?? [])
        .filter((r) => r.status === "upcoming" || r.status === "active")
        .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))
        .slice(0, 4),
    [reservations.data],
  );
  const s = stats.data;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-card sm:p-8">
        <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/15" />
        <span aria-hidden="true" className="absolute -bottom-14 right-16 h-32 w-32 rounded-full border border-gold-500/30" />
        <div className="relative">
          <p className="text-sm font-medium text-gold-400">Partner dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{partner?.companyName || partner?.name}</h1>
          <p className="mt-2 max-w-lg text-navy-100">
            {s === undefined
              ? "Loading your fleet…"
              : s.totalCars === 0
                ? "Add your first car and start earning when it is parked."
                : s.bookedCars
                  ? `${s.bookedCars} of your ${s.totalCars === 1 ? "car is" : "cars are"} out on a rental right now.`
                  : `You have ${s.upcomingReservations} upcoming ${s.upcomingReservations === 1 ? "reservation" : "reservations"}.`}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button href="/partner/cars/new">
              <PlusIcon width={16} height={16} /> Add a car
            </Button>
            <Button href="/partner/reservations" variant="outline-light">
              View reservations
            </Button>
          </div>
        </div>
      </section>

      {stats.error ? (
        <ErrorBlock message={stats.error} onRetry={stats.reload} />
      ) : (
        <section aria-label="Fleet summary" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total cars" value={s?.totalCars} tone="bg-navy-900" />
          <StatCard label="Available cars" value={s?.availableCars} tone="bg-[#1E6B45]" />
          <StatCard label="Currently booked" value={s?.bookedCars} tone="bg-navy-700" />
          <StatCard label="Upcoming reservations" value={s?.upcomingReservations} tone="bg-gold-500" />
          <StatCard label="Total reservations" value={s?.totalReservations} tone="bg-gold-700" className="col-span-2 lg:col-span-1" />
        </section>
      )}

      <div className="grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="upcoming-heading">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="upcoming-heading" className="text-lg font-semibold text-navy-900">
              Next reservations
            </h2>
            <Link href="/partner/reservations" className="text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
              View all
            </Link>
          </div>
          {reservations.error ? (
            <ErrorBlock message={reservations.error} onRetry={reservations.reload} />
          ) : reservations.loading ? (
            <LoadingBlock label="Loading reservations" rows={2} />
          ) : upcoming.length === 0 ? (
            <EmptyBlock title="No upcoming reservations" text="When a customer reserves one of your cars it will show up here." />
          ) : (
            <ul className={`${panel} divide-y divide-navy-900/10`}>
              {upcoming.map((r) => (
                <li key={r.id}>
                  <Link href={`/partner/reservations/${r.id}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-navy-900/[0.03] sm:p-5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900">{carName(r.car)}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {r.customer.name} · {formatDateTime(r.pickupDate)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={r.status} />
                      <span className="text-sm font-semibold text-navy-900">{formatPrice(r.totalPrice)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="fleet-heading">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="fleet-heading" className="text-lg font-semibold text-navy-900">
              Your cars
            </h2>
            <Link href="/partner/cars" className="text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
              Manage cars
            </Link>
          </div>
          {cars.error ? (
            <ErrorBlock message={cars.error} onRetry={cars.reload} />
          ) : cars.loading ? (
            <LoadingBlock label="Loading cars" rows={2} />
          ) : !cars.data?.length ? (
            <EmptyBlock
              title="No cars yet"
              text="Add a car with photos, a daily price and a pickup location."
              action={
                <Button href="/partner/cars/new">
                  Add Car <ArrowRightIcon width={16} height={16} />
                </Button>
              }
            />
          ) : (
            <ul className={`${panel} divide-y divide-navy-900/10`}>
              {cars.data.slice(0, 4).map((c) => (
                <li key={c.id}>
                  <Link href={`/partner/cars/${c.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-navy-900/[0.03]">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                      <PartnerCarImage car={c} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-navy-900">{carName(c)}</p>
                      <p className="text-sm text-muted">{formatPrice(c.dailyPrice)} per day</p>
                    </div>
                    <CarStatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
