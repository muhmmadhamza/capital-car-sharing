"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarIcon, ClockIcon, XCircleIcon } from "@/components/ui/Icons";
import { NO_RESERVATION_FILTERS, PAGE_SIZE, filterReservations, reservationFiltersActive, type ReservationFilters } from "@/features/admin/filters";
import { RESERVATION_LABELS, reservationTone } from "@/features/admin/status";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime, rentalDays } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { getReservations } from "@/services/admin/reservation.service";
import type { AdminReservationView } from "@/types/admin";
import type { ReservationStatus } from "@/types/reservation";
import { CheckCircleIcon } from "../AdminIcons";
import { ClearFiltersButton, DateFilter, FilterSelect, SearchInput, type FilterOption } from "../controls";
import { EmptyState, ErrorState, LoadingRows, Meta, PageHeader, Pagination, RowActions, StatCard, StatusPill, panel } from "../ui";

const STATUSES: ReservationStatus[] = ["upcoming", "active", "completed", "cancelled"];
const isStatus = (v: string | null): v is ReservationStatus => STATUSES.some((s) => s === v);

const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

const durationLabel = (r: AdminReservationView) => {
  const days = rentalDays(r.pickupDate, r.returnDate);
  return `${days} day${days === 1 ? "" : "s"}`;
};

function optionsFrom(rows: AdminReservationView[], value: (r: AdminReservationView) => string, label: (r: AdminReservationView) => string): FilterOption[] {
  const map = new Map<string, string>();
  rows.forEach((r) => map.set(value(r), label(r)));
  return Array.from(map, ([v, l]) => ({ value: v, label: l })).sort((a, b) => a.label.localeCompare(b.label));
}

export function ReservationsView() {
  const params = useSearchParams();
  const initialStatus = params.get("status");
  const { data, loading, error, reload } = useAsync(getReservations, []);

  const [filters, setFilters] = useState<ReservationFilters>({ ...NO_RESERVATION_FILTERS, status: isStatus(initialStatus) ? initialStatus : "all" });
  const [page, setPage] = useState(1);

  const rows = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(() => filterReservations(rows, filters), [rows, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = reservationFiltersActive(filters);

  const count = (s: ReservationStatus) => rows.filter((r) => r.status === s).length;
  const customerOptions = useMemo(() => optionsFrom(rows, (r) => r.customerId, (r) => r.customerName), [rows]);
  const partnerOptions = useMemo(() => optionsFrom(rows, (r) => r.partnerId, (r) => r.partnerName), [rows]);
  const carOptions = useMemo(() => optionsFrom(rows, (r) => r.carId, (r) => r.carName), [rows]);
  const statusOptions: FilterOption[] = STATUSES.map((s) => ({ value: s, label: RESERVATION_LABELS[s] }));

  const set = <K extends keyof ReservationFilters>(key: K, value: ReservationFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const clear = () => {
    setFilters(NO_RESERVATION_FILTERS);
    setPage(1);
  };

  return (
    <>
      <PageHeader title="Reservations" description="Every booking across customers and partners. Open one to see who rented what, and when." />

      {data ? (
        <section aria-label="Reservation summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Upcoming" value={count("upcoming")} icon={CalendarIcon} />
          <StatCard label="Active" value={count("active")} icon={ClockIcon} />
          <StatCard label="Completed" value={count("completed")} icon={CheckCircleIcon} />
          <StatCard label="Cancelled" value={count("cancelled")} icon={XCircleIcon} />
        </section>
      ) : null}

      <section className={panel} aria-label="Reservation list">
        <div className="grid gap-3 border-b border-navy-900/10 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
          <div className="sm:col-span-2 xl:col-span-2">
            <SearchInput value={filters.query} placeholder="Reservation ID, customer, car or partner" onChange={(v) => set("query", v)} />
          </div>
          <FilterSelect label="Status" value={filters.status} allLabel="All statuses" options={statusOptions} onChange={(v) => set("status", v as ReservationFilters["status"])} />
          <FilterSelect label="Customer" value={filters.customerId} allLabel="All customers" options={customerOptions} onChange={(v) => set("customerId", v)} />
          <FilterSelect label="Partner" value={filters.partnerId} allLabel="All partners" options={partnerOptions} onChange={(v) => set("partnerId", v)} />
          <FilterSelect label="Car" value={filters.carId} allLabel="All cars" options={carOptions} onChange={(v) => set("carId", v)} />
          <DateFilter label="Rental from" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={(v) => set("dateFrom", v)} />
          <DateFilter label="Rental to" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={(v) => set("dateTo", v)} />
          {filtering ? (
            <div className="flex items-end sm:col-span-2 xl:col-span-4">
              <ClearFiltersButton onClick={clear} />
            </div>
          ) : null}
        </div>

        {loading && !data ? (
          <div className="p-4 sm:p-5">
            <LoadingRows label="Loading reservations" />
          </div>
        ) : error && !data ? (
          <div className="p-4 sm:p-5">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtering ? "No reservations match your filters" : "No reservations yet"}
            text={filtering ? "Try a different search or date range, or clear the filters to see every reservation." : "Reservations appear here as soon as customers book a car."}
            action={filtering ? <ClearFiltersButton onClick={clear} /> : undefined}
          />
        ) : (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {filtered.length} reservation{filtered.length === 1 ? "" : "s"} found
            </p>

            {/* Wide screens: table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[78rem]">
                <caption className="sr-only">Reservations</caption>
                <thead className="bg-navy-900/[0.03]">
                  <tr>
                    <th scope="col" className={th}>Reservation</th>
                    <th scope="col" className={th}>Customer</th>
                    <th scope="col" className={th}>Partner</th>
                    <th scope="col" className={th}>Car</th>
                    <th scope="col" className={th}>Pickup location</th>
                    <th scope="col" className={th}>Pickup</th>
                    <th scope="col" className={th}>Return</th>
                    <th scope="col" className={th}>Duration</th>
                    <th scope="col" className={th}>Daily price</th>
                    <th scope="col" className={th}>Total</th>
                    <th scope="col" className={th}>Status</th>
                    <th scope="col" className={`${th} text-right`}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {visible.map((r) => (
                    <tr key={r.id} className="hover:bg-navy-900/[0.02]">
                      <td className={`${td} whitespace-nowrap font-mono text-xs`}>
                        <Link href={`/admin/reservations/${r.id}`} className="font-semibold hover:text-gold-700">{r.id}</Link>
                      </td>
                      <td className={td}>
                        <Link href={`/admin/customers/${r.customerId}`} className="block max-w-[9rem] truncate font-medium hover:text-gold-700" title={r.customerName}>{r.customerName}</Link>
                      </td>
                      <td className={td}>
                        <Link href={`/admin/partners/${r.partnerId}`} className="block max-w-[10rem] truncate hover:text-gold-700" title={r.partnerName}>{r.partnerName}</Link>
                      </td>
                      <td className={td}>
                        <Link href={`/admin/cars/${r.carId}`} className="block max-w-[11rem] truncate hover:text-gold-700" title={r.carName}>{r.carName}</Link>
                      </td>
                      <td className={td}><span className="block max-w-[9rem] truncate" title={r.pickupLocation}>{r.pickupLocation}</span></td>
                      <td className={`${td} whitespace-nowrap`}>{formatDateTime(r.pickupDate)}</td>
                      <td className={`${td} whitespace-nowrap`}>{formatDateTime(r.returnDate)}</td>
                      <td className={`${td} whitespace-nowrap`}>{durationLabel(r)}</td>
                      <td className={`${td} whitespace-nowrap`}>{formatPrice(r.dailyPrice)}</td>
                      <td className={`${td} whitespace-nowrap font-semibold`}>{formatPrice(r.totalPrice)}</td>
                      <td className={td}><StatusPill tone={reservationTone(r.status)}>{RESERVATION_LABELS[r.status]}</StatusPill></td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/reservations/${r.id}`}
                            aria-label={`View reservation ${r.id}`}
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-navy-900/25 px-3.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900/5"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narrower screens: stacked cards */}
            <ul className="divide-y divide-navy-900/10 xl:hidden">
              {visible.map((r) => (
                <li key={r.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/reservations/${r.id}`} className="block truncate font-semibold text-navy-900 hover:text-gold-700">{r.carName}</Link>
                      <p className="font-mono text-xs text-muted">{r.id}</p>
                    </div>
                    <StatusPill tone={reservationTone(r.status)}>{RESERVATION_LABELS[r.status]}</StatusPill>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                    <Meta label="Customer" value={<Link href={`/admin/customers/${r.customerId}`} className="hover:text-gold-700">{r.customerName}</Link>} />
                    <Meta label="Partner" value={<Link href={`/admin/partners/${r.partnerId}`} className="hover:text-gold-700">{r.partnerName}</Link>} />
                    <Meta label="Pickup location" value={r.pickupLocation} />
                    <Meta label="Pickup" value={formatDateTime(r.pickupDate)} />
                    <Meta label="Return" value={formatDateTime(r.returnDate)} />
                    <Meta label="Duration" value={durationLabel(r)} />
                    <Meta label="Daily price" value={formatPrice(r.dailyPrice)} />
                    <Meta label="Total" value={formatPrice(r.totalPrice)} />
                  </dl>
                  <div className="mt-4 flex">
                    <RowActions name={r.id} primary={{ label: "View", href: `/admin/reservations/${r.id}` }} actions={[{ label: "View customer", href: `/admin/customers/${r.customerId}` }, { label: "View partner", href: `/admin/partners/${r.partnerId}` }, { label: "View car", href: `/admin/cars/${r.carId}` }]} />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </section>
    </>
  );
}
