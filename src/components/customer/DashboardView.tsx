"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { summarize } from "@/features/reservations/status";
import { useReservations } from "@/hooks/useReservations";
import { cn } from "@/lib/utils";
import { ReservationCard } from "./ReservationCard";
import { EmptyBlock, ErrorBlock, LoadingBlock, Skeleton, panel } from "./States";

function StatCard({ label, value, hint, tone }: { label: string; value: number | undefined; hint?: string; tone: string }) {
  return (
    <div className={cn(panel, "relative overflow-hidden p-5")}>
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone)} />
      <p className="text-sm font-medium text-navy-700">{label}</p>
      {value === undefined ? <Skeleton className="mt-2 h-9 w-12" /> : <p className="mt-1 font-display text-4xl font-semibold text-navy-900">{value}</p>}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function DashboardView() {
  const { customer } = useAuth();
  const { data, loading, error, reload } = useReservations();
  const summary = useMemo(() => (data ? summarize(data) : undefined), [data]);

  const firstName = customer?.name.split(" ")[0] ?? "";
  // The trip to look forward to: the one on the road now, otherwise the soonest upcoming.
  const focus = useMemo(() => {
    if (!data) return undefined;
    return (
      data.find((r) => r.status === "active") ??
      data.filter((r) => r.status === "upcoming").sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))[0]
    );
  }, [data]);
  const recent = useMemo(() => (data ?? []).filter((r) => r.id !== focus?.id).slice(0, 3), [data, focus]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-navy-900 p-6 text-white shadow-card sm:p-8">
        <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/15" />
        <span aria-hidden="true" className="absolute -bottom-14 right-16 h-32 w-32 rounded-full border border-gold-500/30" />
        <div className="relative">
          <p className="text-sm font-medium text-gold-400">Welcome back</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{customer?.name ?? firstName}</h1>
          <p className="mt-2 max-w-lg text-navy-100">
            {summary?.active
              ? "You have a car on the road right now. Safe travels."
              : summary?.upcoming
                ? `You have ${summary.upcoming} upcoming ${summary.upcoming === 1 ? "reservation" : "reservations"}.`
                : "Ready for your next trip? Pick a car and your dates."}
          </p>
          <Button href="/cars" className="mt-5">
            Browse cars <ArrowRightIcon width={16} height={16} />
          </Button>
        </div>
      </section>

      <section aria-label="Reservation summary" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total reservations" value={summary?.total} tone="bg-navy-900" />
        <StatCard label="Upcoming" value={summary?.upcoming} hint={summary?.active ? `${summary.active} active now` : undefined} tone="bg-gold-500" />
        <StatCard label="Completed" value={summary?.completed} tone="bg-[#1E6B45]" />
        <StatCard label="Cancelled" value={summary?.cancelled} tone="bg-[#B3261E]" />
      </section>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingBlock label="Loading your reservations" rows={2} />
      ) : data && data.length === 0 ? (
        <EmptyBlock
          title="No reservations yet"
          text="Once you reserve a car, your trips will show up here."
          action={<Button href="/cars">Find a car</Button>}
        />
      ) : (
        <>
          {focus ? (
            <section aria-labelledby="focus-heading">
              <h2 id="focus-heading" className="mb-3 text-lg font-semibold text-navy-900">
                {focus.status === "active" ? "On the road now" : "Next trip"}
              </h2>
              <ReservationCard reservation={focus} />
            </section>
          ) : null}

          {recent.length ? (
            <section aria-labelledby="recent-heading">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 id="recent-heading" className="text-lg font-semibold text-navy-900">
                  Recent reservations
                </h2>
                <Link href="/customer/reservations" className="text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {recent.map((r) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
