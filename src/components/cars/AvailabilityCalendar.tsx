"use client";

import { useMemo, useState } from "react";
import type { DateKey } from "@/types/booking";
import { dayState, lastSelectableReturnDay, RENTAL_RULES } from "@/features/availability";
import { addMonths, combine, dateOf, daysInMonth, formatDate, formatMonth, weekdayMon0 } from "@/lib/date";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { useBooking } from "./BookingProvider";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Month({ month }: { month: DateKey }) {
  const { blocks, now, startDate, endDate, pickupTime, selectDay } = useBooking();
  const today = dateOf(now);
  const lead = weekdayMon0(month);
  const total = daysInMonth(month);

  // While the customer is choosing a return day, nothing past the next booking is selectable.
  const lastReturn =
    startDate && !endDate ? lastSelectableReturnDay(blocks, combine(startDate, pickupTime)) : undefined;

  const cells: (DateKey | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: total }, (_, i) => `${month.slice(0, 8)}${String(i + 1).padStart(2, "0")}`),
  ];

  return (
    <div>
      <h3 className="mb-3 text-center text-base font-semibold text-navy-900">{formatMonth(month)}</h3>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1.5">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <span key={`pad-${i}`} />;
          const state = dayState(blocks, day);
          const past = day < today;
          const beyondLimit = lastReturn !== undefined && day > lastReturn;
          const disabled = past || state === "booked" || beyondLimit;
          const isStart = day === startDate;
          const isEnd = day === endDate;
          const inRange = Boolean(startDate && endDate && day > startDate && day < endDate);

          const reason = past
            ? "in the past"
            : state === "booked"
              ? "booked"
              : beyondLimit
                ? "unavailable, a booking starts before then"
                : state === "partial"
                  ? "partly booked, check times"
                  : "available";

          return (
            <div key={day} className={cn("flex justify-center", inRange && "bg-gold-500/20", isStart && endDate && "rounded-l-full bg-gold-500/20", isEnd && "rounded-r-full bg-gold-500/20")}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={isStart || isEnd}
                aria-label={`${formatDate(day)}, ${isStart ? "pickup, " : isEnd ? "return, " : ""}${reason}`}
                onClick={() => selectDay(day)}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
                  disabled
                    ? state === "booked" && !past
                      ? "cursor-not-allowed bg-navy-900/[0.07] text-navy-900/40 line-through"
                      : "cursor-not-allowed text-navy-900/30"
                    : "font-medium text-navy-900 hover:bg-navy-900/10",
                  (isStart || isEnd) && "!bg-navy-900 !text-white hover:!bg-navy-900",
                  day === today && !isStart && !isEnd && "ring-1 ring-inset ring-gold-700",
                )}
              >
                {Number(day.slice(8))}
                {state === "partial" && !disabled ? (
                  <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-gold-500" />
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AvailabilityCalendar() {
  const { now, startDate, endDate, clear } = useBooking();
  const first = `${dateOf(now).slice(0, 7)}-01`;
  const last = addMonths(first, RENTAL_RULES.calendarMonthsAhead);
  const [view, setView] = useState<DateKey>(startDate ? `${startDate.slice(0, 7)}-01` : first);
  const second = useMemo(() => addMonths(view, 1), [view]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(addMonths(view, -1))}
          disabled={view <= first}
          aria-label="Previous month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 hover:bg-navy-900/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon />
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {!startDate ? "Select your pickup day" : !endDate ? "Now select your return day" : `${formatDate(startDate)} to ${formatDate(endDate)}`}
        </p>
        <button
          type="button"
          onClick={() => setView(addMonths(view, 1))}
          disabled={second >= last}
          aria-label="Next month"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-900/20 text-navy-900 hover:bg-navy-900/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <Month month={view} />
        <div className="hidden md:block">
          <Month month={second} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-navy-900/10 pt-4 text-xs text-navy-700">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full border border-navy-900/30 bg-white" /> Available
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="relative h-3.5 w-3.5 rounded-full border border-navy-900/30 bg-white">
              <span className="absolute inset-x-0 bottom-0.5 mx-auto h-1 w-1 rounded-full bg-gold-500" />
            </span>{" "}
            Partly booked
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-navy-900/[0.12]" /> Booked
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-navy-900" /> Your dates
          </li>
        </ul>
        {startDate ? (
          <button type="button" onClick={clear} className="font-medium text-gold-700 underline underline-offset-2 hover:text-navy-900">
            Clear dates
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted">Booked days, and days beyond the next booking, cannot be selected.</p>
    </div>
  );
}
