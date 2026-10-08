"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, Skeleton, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/FormControls";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { DAY_STATUS_LABELS } from "@/features/partners/catalog";
import { useAsync } from "@/hooks/useAsync";
import { usePartnerCars } from "@/hooks/usePartnerData";
import { addDays, addMonths, dateOf, formatDate, formatMonth, nowWall, weekdayMon0 } from "@/lib/date";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/services/errors";
import { partnerData } from "@/services/partner";
import type { DateKey } from "@/types/booking";
import type { Availability, CarDayStatus, PartnerCarView } from "@/types/partner";
import { usePartnerAuth } from "./PartnerAuthProvider";
import { CarStatusBadge, PartnerCarImage, carName } from "./parts";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_AHEAD = 12;

const dayStyle: Record<CarDayStatus, string> = {
  available: "border-navy-900/15 bg-white text-navy-900 hover:border-navy-900/50",
  unavailable: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17] hover:border-[#B3261E]/60",
  booked: "cursor-not-allowed border-navy-900 bg-navy-900 text-white",
};

function MonthGrid({
  days,
  today,
  selected,
  onPick,
}: {
  days: Availability[];
  today: DateKey;
  selected: Set<DateKey>;
  onPick: (date: DateKey, shift: boolean) => void;
}) {
  const lead = days.length ? weekdayMon0(days[0].date) : 0;
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted sm:gap-2">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1.5">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: lead }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map(({ date, status }) => {
          const past = date < today;
          const readOnly = past || status === "booked";
          const isSelected = selected.has(date);
          const label = `${formatDate(date)}, ${past ? "in the past" : DAY_STATUS_LABELS[status].toLowerCase()}${status === "booked" ? ", read-only" : ""}${isSelected ? ", selected" : ""}`;
          return (
            <button
              key={date}
              type="button"
              disabled={readOnly}
              aria-pressed={readOnly ? undefined : isSelected}
              aria-label={label}
              title={status === "booked" ? "Booked by a reservation. This cannot be changed." : undefined}
              onClick={(e) => onPick(date, e.shiftKey)}
              className={cn(
                "relative flex aspect-square min-h-11 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                past ? "cursor-not-allowed border-transparent bg-transparent text-navy-900/30" : dayStyle[status],
                status === "booked" && past && "bg-navy-900/60",
                isSelected && "!border-gold-500 !bg-gold-500 !text-navy-950 ring-2 ring-gold-500/40",
                date === today && !isSelected && "ring-2 ring-inset ring-gold-700",
              )}
            >
              {Number(date.slice(8))}
              {status === "booked" && !past ? <span aria-hidden="true" className="absolute bottom-1 h-0.5 w-3 rounded-full bg-gold-400" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  const item = (swatch: string, label: string) => (
    <li className="inline-flex items-center gap-2">
      <span className={cn("h-4 w-4 rounded-md border", swatch)} /> {label}
    </li>
  );
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-navy-700">
      {item("border-navy-900/20 bg-white", "Available")}
      {item("border-[#B3261E]/30 bg-[#FBEAE9]", "Unavailable")}
      {item("border-navy-900 bg-navy-900", "Booked (read-only)")}
      {item("border-gold-500 bg-gold-500", "Selected")}
    </ul>
  );
}

function Calendar({ car }: { car: PartnerCarView }) {
  const { partner } = usePartnerAuth();
  const today = dateOf(nowWall());
  const firstMonth: DateKey = `${today.slice(0, 7)}-01`;
  const lastMonth = addMonths(firstMonth, MONTHS_AHEAD);

  const [month, setMonth] = useState<DateKey>(firstMonth);
  const [selected, setSelected] = useState<Set<DateKey>>(new Set());
  const [anchor, setAnchor] = useState<DateKey>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const partnerId = partner?.id ?? "";
  const { data, loading, error, reload } = useAsync(() => partnerData.getAvailability(partnerId, car.id, month), [partnerId, car.id, month]);

  const counts = useMemo(() => {
    const c = { available: 0, unavailable: 0, booked: 0 };
    for (const d of data ?? []) if (d.date >= today || d.status === "booked") c[d.status] += 1;
    return c;
  }, [data, today]);

  const statusOf = useMemo(() => new Map((data ?? []).map((d) => [d.date, d.status])), [data]);
  const selectable = useCallback((d: DateKey) => d >= today && statusOf.get(d) !== "booked", [today, statusOf]);

  function go(delta: number) {
    setMonth(addMonths(month, delta));
    setSelected(new Set());
    setAnchor(undefined);
    setNotice(undefined);
    setSaveError(undefined);
  }

  function onPick(date: DateKey, shift: boolean) {
    setNotice(undefined);
    setSaveError(undefined);
    setSelected((prev) => {
      const next = new Set(prev);
      if (shift && anchor) {
        const [from, to] = anchor <= date ? [anchor, date] : [date, anchor];
        for (let d = from; d <= to; d = addDays(d, 1)) if (selectable(d)) next.add(d);
      } else if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
    setAnchor(date);
  }

  function selectOpenDays() {
    setSelected(new Set((data ?? []).filter((d) => selectable(d.date)).map((d) => d.date)));
    setNotice(undefined);
  }

  async function apply(status: "available" | "unavailable") {
    if (!partner || selected.size === 0) return;
    setSaving(true);
    setSaveError(undefined);
    setNotice(undefined);
    try {
      const dates = [...selected].sort();
      await partnerData.setAvailability(partner.id, car.id, dates, status);
      setNotice(`${dates.length} ${dates.length === 1 ? "day" : "days"} marked ${status}.`);
      setSelected(new Set());
      setAnchor(undefined);
      reload();
    } catch (e) {
      setSaveError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={cn(panel, "p-4 sm:p-6")} aria-label={`Availability calendar for ${carName(car)}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={month <= firstMonth}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 hover:bg-navy-900/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-base font-semibold text-navy-900 sm:text-lg" aria-live="polite">
          {formatMonth(month)}
        </h2>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={month >= lastMonth}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 hover:bg-navy-900/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : loading && !data ? (
          <Skeleton className="h-80 rounded-xl" />
        ) : (
          <div className={cn(loading && "opacity-60 transition-opacity")}>
            <MonthGrid days={data ?? []} today={today} selected={selected} onPick={onPick} />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-navy-900/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Legend />
        <p className="text-xs text-muted">
          {counts.available} available · {counts.unavailable} unavailable · {counts.booked} booked
        </p>
      </div>

      <div className="mt-5 rounded-xl bg-navy-900/[0.04] p-4">
        <p className="text-sm font-medium text-navy-900" aria-live="polite">
          {selected.size === 0 ? "Select days to change them. Shift-click selects a range." : `${selected.size} ${selected.size === 1 ? "day" : "days"} selected`}
        </p>
        {saveError ? (
          <div className="mt-3">
            <FormAlert>{saveError}</FormAlert>
          </div>
        ) : null}
        {notice ? (
          <p role="status" className="mt-3 flex items-center gap-2 text-sm font-medium text-[#14543A]">
            <CheckIcon width={16} height={16} /> {notice}
          </p>
        ) : null}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button onClick={() => apply("available")} disabled={saving || selected.size === 0}>
            Mark Available
          </Button>
          <Button variant="navy" onClick={() => apply("unavailable")} disabled={saving || selected.size === 0}>
            Mark Unavailable
          </Button>
          <Button variant="outline-navy" onClick={selectOpenDays} disabled={saving || loading}>
            Select all open days
          </Button>
          <Button variant="outline-navy" onClick={() => setSelected(new Set())} disabled={saving || selected.size === 0}>
            Clear selection
          </Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">Booked days come from customer reservations and cannot be changed here.</p>
      </div>
    </section>
  );
}

export function AvailabilityManager() {
  const cars = usePartnerCars();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const wanted = params.get("car");

  const car = useMemo(() => {
    const list = cars.data ?? [];
    return list.find((c) => c.id === wanted) ?? list[0];
  }, [cars.data, wanted]);

  return (
    <div>
      <PageHeader title="Availability" description="Choose a car, then mark the days it can or cannot be rented." />

      {cars.error ? (
        <ErrorBlock message={cars.error} onRetry={cars.reload} />
      ) : cars.loading ? (
        <LoadingBlock label="Loading your cars" rows={2} />
      ) : !car || !cars.data ? (
        <EmptyBlock title="Add a car first" text="You need at least one car before you can manage availability." action={<Button href="/partner/cars/new">Add Car</Button>} />
      ) : (
        <div className="space-y-5">
          <div className={cn(panel, "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5")}>
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <PartnerCarImage car={car} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-navy-900">{carName(car)}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <CarStatusBadge status={car.status} />
                <Link href={`/partner/cars/${car.id}`} className="text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
                  View car
                </Link>
              </div>
            </div>
            {cars.data.length > 1 ? (
              <SelectField
                label="Car"
                value={car.id}
                onChange={(e) => router.replace(`${pathname}?car=${encodeURIComponent(e.target.value)}`)}
                className="w-full sm:w-64"
              >
                {cars.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {carName(c)} ({c.year})
                  </option>
                ))}
              </SelectField>
            ) : null}
          </div>
          {car.status === "pending" ? (
            <p className="rounded-lg border border-gold-700/30 bg-gold-500/10 px-4 py-3 text-sm text-navy-900">
              This car is pending review. You can prepare its calendar now; it goes live once verified.
            </p>
          ) : null}
          {/* key: a fresh calendar (and cleared selection) for every car */}
          <Calendar key={car.id} car={car} />
        </div>
      )}
    </div>
  );
}
