"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdvanceBadge } from "@/components/customer/AdvanceBadge";
import { StatusBadge } from "@/components/customer/StatusBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/FormControls";
import { CalendarIcon, PinIcon } from "@/components/ui/Icons";
import { STATUS_LABELS, STATUS_ORDER } from "@/features/reservations/status";
import { usePartnerCars, usePartnerReservations } from "@/hooks/usePartnerData";
import { dateOf, formatDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import type { PartnerReservationView } from "@/types/partner";
import type { BookingType } from "@/types/booking";
import type { ReservationStatus } from "@/types/reservation";
import { carName } from "./parts";

type Filters = { status: ReservationStatus | "all"; carId: string; date: string; search: string; type: BookingType | "all" };
const NO_FILTERS: Filters = { status: "all", carId: "all", date: "", search: "", type: "all" };

/** A reservation matches a date when the car is out on that day (pickup day to return day). */
const coversDate = (r: PartnerReservationView, date: string) => dateOf(r.pickupDate) <= date && date <= dateOf(r.returnDate);

function Card({ r }: { r: PartnerReservationView }) {
  return (
    <article className={`${panel} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-navy-900">{carName(r.car)}</p>
          <p className="truncate text-sm text-navy-700">{r.customer.name}</p>
          {r.bookingReference ? <p className="mt-0.5 font-mono text-xs text-muted">{r.bookingReference}</p> : null}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={r.status} />
          <AdvanceBadge bookingType={r.bookingType} />
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs font-medium text-muted">Pickup</dt>
          <dd className="font-medium text-navy-900">{formatDateTime(r.pickupDate)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">Return</dt>
          <dd className="font-medium text-navy-900">{formatDateTime(r.returnDate)}</dd>
        </div>
        <div className="col-span-2 flex items-start gap-1.5">
          <dt className="sr-only">Pickup location</dt>
          <PinIcon width={14} height={14} className="mt-0.5 shrink-0 text-gold-700" />
          <dd className="break-words text-navy-700">{r.pickupLocation}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-muted">Contact</dt>
          <dd className="break-all text-navy-900">{r.customer.phone}</dd>
          <dd className="break-all text-navy-700">{r.customer.email}</dd>
        </div>
        <div className="text-right">
          <dt className="text-xs font-medium text-muted">
            {r.days} {r.days === 1 ? "day" : "days"} × {formatPrice(r.dailyPrice)}
          </dt>
          <dd className="font-display text-xl font-semibold text-navy-900">{formatPrice(r.totalPrice)}</dd>
        </div>
      </dl>
      <Button href={`/partner/reservations/${r.id}`} variant="outline-navy" className="mt-4 w-full">
        View details
      </Button>
    </article>
  );
}

function Table({ rows }: { rows: PartnerReservationView[] }) {
  const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
  return (
    <div className={`${panel} overflow-hidden`}>
      <table className="w-full text-sm">
        <caption className="sr-only">Reservations for your cars</caption>
        <thead className="border-b border-navy-900/10 bg-navy-900/[0.03]">
          <tr>
            <th scope="col" className={th}>Customer</th>
            <th scope="col" className={th}>Car</th>
            <th scope="col" className={th}>Pickup</th>
            <th scope="col" className={th}>Return</th>
            <th scope="col" className={`${th} text-right`}>Days</th>
            <th scope="col" className={`${th} text-right`}>Daily</th>
            <th scope="col" className={`${th} text-right`}>Total</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={th}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-900/10">
          {rows.map((r) => (
            <tr key={r.id} className="align-top hover:bg-navy-900/[0.02]">
              <td className="px-4 py-3.5">
                <p className="font-semibold text-navy-900">{r.customer.name}</p>
                {r.bookingReference ? <p className="font-mono text-xs text-muted">{r.bookingReference}</p> : null}
                <p className="break-all text-xs text-muted">{r.customer.email}</p>
                <p className="text-xs text-muted">{r.customer.phone}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="font-medium text-navy-900">{carName(r.car)}</p>
                <p className="text-xs text-muted">{r.car.year}</p>
              </td>
              <td className="px-4 py-3.5">
                <p className="whitespace-nowrap font-medium text-navy-900">{formatDateTime(r.pickupDate)}</p>
                <p className="max-w-[11rem] break-words text-xs text-muted">{r.pickupLocation}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3.5 font-medium text-navy-900">{formatDateTime(r.returnDate)}</td>
              <td className="px-4 py-3.5 text-right text-navy-900">{r.days}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-right text-navy-900">{formatPrice(r.dailyPrice)}</td>
              <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-navy-900">{formatPrice(r.totalPrice)}</td>
              <td className="px-4 py-3.5">
                <div className="flex flex-col items-start gap-1.5">
                  <StatusBadge status={r.status} />
                  <AdvanceBadge bookingType={r.bookingType} />
                </div>
              </td>
              <td className="px-4 py-3.5 text-right">
                <Link href={`/partner/reservations/${r.id}`} className="whitespace-nowrap font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
                  View<span className="sr-only"> reservation for {r.customer.name}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PartnerReservationsView() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [searchText, setSearchText] = useState("");
  // The API filters by status, car and search (and only ever returns this partner's bookings).
  const { data, loading, error, reload } = usePartnerReservations({
    status: filters.status === "all" ? undefined : filters.status,
    carId: filters.carId === "all" ? undefined : filters.carId,
    search: filters.search || undefined,
    bookingType: filters.type === "all" ? undefined : filters.type,
  });
  const { data: myCars } = usePartnerCars();
  const cars = useMemo(() => (myCars ?? []).map((c): [string, string] => [c.id, `${carName(c)} (${c.year})`]), [myCars]);

  const rows = useMemo(() => (data ?? []).filter((r) => !filters.date || coversDate(r, filters.date)), [data, filters.date]);
  const filtered = filters.status !== "all" || filters.carId !== "all" || filters.date !== "" || filters.search !== "" || filters.type !== "all";
  const clear = () => { setFilters(NO_FILTERS); setSearchText(""); };
  const pendingCount = (data ?? []).filter((r) => r.status === "pending").length;

  return (
    <div>
      <PageHeader title="Reservations" description="Every booking on your cars. Payments are not connected yet, so amounts are for reference." />

      {pendingCount > 0 && filters.status === "all" ? (
        <p role="status" className="mb-4 rounded-xl border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm font-medium text-navy-900">
          {pendingCount} {pendingCount === 1 ? "request is" : "requests are"} waiting for your decision.
        </p>
      ) : null}

      {(data && data.length > 0) || filtered ? (
        <section aria-label="Filters" className={`${panel} mb-5 p-4 sm:p-5`}>
          <form
            className="mb-4 flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => { e.preventDefault(); setFilters((f) => ({ ...f, search: searchText.trim() })); }}
          >
            <FormField label="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Reference, customer or car" className="sm:flex-1" />
            <Button type="submit" variant="navy" className="sm:mt-[1.65rem]">Search</Button>
          </form>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <SelectField label="Status" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))}>
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </SelectField>
            <SelectField label="Booking type" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as Filters["type"] }))}>
              <option value="all">All bookings</option>
              <option value="advance">Advance reservations</option>
              <option value="standard">Standard</option>
            </SelectField>
            <SelectField label="Car" value={filters.carId} onChange={(e) => setFilters((f) => ({ ...f, carId: e.target.value }))}>
              <option value="all">All cars</option>
              {cars.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </SelectField>
            <FormField label="Date" type="date" value={filters.date} onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))} hint="Cars out on this day" />
            <Button variant="outline-navy" onClick={clear} disabled={!filtered} className="lg:mb-0">
              Clear filters
            </Button>
          </div>
        </section>
      ) : null}

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingBlock label="Loading reservations" rows={3} />
      ) : !filtered && (!data || data.length === 0) ? (
        <EmptyBlock title="No reservations yet" text="When customers reserve your cars, their bookings will appear here." action={<Button href="/partner/cars">View my cars</Button>} />
      ) : rows.length === 0 ? (
        <EmptyBlock
          title="No reservations match"
          text="Try a different status, car or date."
          action={
            <Button variant="outline-navy" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <p className="mb-3 flex items-center gap-2 text-sm text-muted" aria-live="polite">
            <CalendarIcon width={16} height={16} className="text-gold-700" />
            {rows.length} {rows.length === 1 ? "reservation" : "reservations"}
            
          </p>
          <div className="hidden xl:block">
            <Table rows={rows} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:hidden">
            {rows.map((r) => (
              <Card key={r.id} r={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
