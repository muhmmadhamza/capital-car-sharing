"use client";

import Link from "next/link";
import { CalendarIcon, CarIcon, CheckIcon, ListIcon, UserIcon } from "@/components/ui/Icons";
import { useAsync } from "@/hooks/useAsync";
import { ACTIVITY_LABELS, activityStatus } from "@/features/admin/status";
import { formatIsoDateTime, timeAgo } from "@/features/admin/format";
import { getDashboard } from "@/services/admin/dashboard.service";
import { cn } from "@/lib/utils";
import type { ActivityType, AdminActivity } from "@/types/admin";
import { BuildingIcon, UsersIcon } from "./AdminIcons";
import { ErrorState, PageHeader, Skeleton, StatCard, StatusPill, panel } from "./ui";

const ACTIVITY_ICONS = {
  customer_registered: UserIcon,
  partner_registered: BuildingIcon,
  car_added: CarIcon,
  reservation_created: ListIcon,
} satisfies Record<ActivityType, unknown>;

function ActivityRow({ item }: { item: AdminActivity }) {
  const Icon = ACTIVITY_ICONS[item.type];
  const { label, tone } = activityStatus(item.type, item.status);
  const body = (
    <>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900/[0.06] text-navy-900">
        <Icon width={19} height={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold-700">{ACTIVITY_LABELS[item.type]}</p>
        <p className="truncate font-semibold text-navy-900">{item.name}</p>
        <p className="truncate text-sm text-muted">{item.detail}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
        <StatusPill tone={tone}>{label}</StatusPill>
        <time dateTime={item.occurredAt} title={formatIsoDateTime(item.occurredAt)} className="text-xs text-muted">
          {timeAgo(item.occurredAt)}
        </time>
      </div>
    </>
  );
  const cls = "flex items-center gap-3 px-4 py-3.5 sm:px-5";
  return item.href ? (
    <Link href={item.href} className={cn(cls, "transition-colors hover:bg-navy-900/[0.03]")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function DashboardSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading dashboard…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const { data, loading, error, reload } = useAsync(getDashboard, []);

  return (
    <>
      <PageHeader title="Dashboard" description="A snapshot of customers, partners, cars and reservations across Capital Car Sharing." />

      {loading && !data ? <DashboardSkeleton /> : null}
      {error && !data ? <ErrorState message={error} onRetry={reload} /> : null}

      {data ? (
        <div className="space-y-6">
          <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Customers" value={data.stats.totalCustomers} icon={UsersIcon} href="/admin/customers" />
            <StatCard label="Total Partners" value={data.stats.totalPartners} icon={BuildingIcon} href="/admin/partners" />
            <StatCard label="Total Cars" value={data.stats.totalCars} icon={CarIcon} />
            <StatCard label="Available Cars" value={data.stats.availableCars} icon={CheckIcon} hint="Approved and open for rent" />
            <StatCard label="Booked Cars" value={data.stats.bookedCars} icon={CarIcon} hint="Out on a rental right now" />
            <StatCard label="Total Reservations" value={data.stats.totalReservations} icon={ListIcon} />
            <StatCard label="Upcoming Reservations" value={data.stats.upcomingReservations} icon={CalendarIcon} />
            <StatCard label="Completed Reservations" value={data.stats.completedReservations} icon={CheckIcon} />
          </section>

          <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section aria-labelledby="activity-heading" className={panel}>
              <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-4 sm:px-5">
                <h2 id="activity-heading" className="text-lg font-semibold text-navy-900">
                  Recent activity
                </h2>
                <span className="text-xs text-muted">Latest {data.activity.length}</span>
              </div>
              {data.activity.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">No activity yet.</p>
              ) : (
                <ul className="divide-y divide-navy-900/10">
                  {data.activity.map((item) => (
                    <li key={item.id}>
                      <ActivityRow item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="attention-heading" className={cn(panel, "p-5")}>
              <h2 id="attention-heading" className="text-lg font-semibold text-navy-900">
                Needs attention
              </h2>
              <p className="mt-1 text-sm text-muted">Items waiting for an admin decision.</p>
              <ul className="mt-4 space-y-2.5">
                <AttentionItem label="Partners awaiting approval" count={data.attention.pendingPartners} href="/admin/partners?status=pending" />
                <AttentionItem label="Cars awaiting approval" count={data.attention.pendingCars} href="/admin/cars?status=pending" />
                <AttentionItem label="Inactive customers" count={data.attention.inactiveCustomers} href="/admin/customers?status=inactive" />
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

function AttentionItem({ label, count, href }: { label: string; count: number; href?: string }) {
  const body = (
    <>
      <span className="text-sm font-medium text-navy-900">{label}</span>
      <span className={cn("inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-sm font-semibold", count > 0 ? "bg-gold-500 text-navy-950" : "bg-navy-900/[0.06] text-navy-700")}>{count}</span>
    </>
  );
  const cls = "flex min-h-12 items-center justify-between gap-3 rounded-xl border border-navy-900/10 px-4 py-2";
  return (
    <li>
      {href ? (
        <Link href={href} className={cn(cls, "transition-colors hover:border-gold-500/60 hover:bg-gold-500/5")}>
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}
