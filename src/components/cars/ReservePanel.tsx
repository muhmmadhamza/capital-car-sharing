"use client";

import type { Car } from "@/types/car";
import type { AvailabilityResult } from "@/types/booking";
import { blockAt, findConflicts } from "@/features/availability";
import { combine, formatDate, formatTimeKey, TIME_SLOTS } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CalendarIcon } from "@/components/ui/Icons";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { useBooking } from "./BookingProvider";

const selectClass =
  "h-11 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-sm text-ink hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60 disabled:bg-navy-900/5 disabled:text-muted";

export function ReservePanel({
  car,
  availability,
  hasWindow,
}: {
  car: Pick<Car, "slug" | "pricePerDay" | "depositAmount">;
  availability: AvailabilityResult;
  hasWindow: boolean;
}) {
  const { blocks, now, startDate, endDate, pickupTime, returnTime, pickup, returnAt, validation, setPickupTime, setReturnTime } =
    useBooking();

  // Times that would clash are greyed out so a conflicting choice is hard to make in the first place.
  const pickupDisabled = (t: string) => {
    if (!startDate) return false;
    const at = combine(startDate, t);
    return at < now || Boolean(blockAt(blocks, at));
  };
  const returnDisabled = (t: string) => {
    if (!endDate || !pickup) return false;
    const at = combine(endDate, t);
    return at <= pickup || findConflicts(blocks, pickup, at).length > 0;
  };

  const ok = validation.ok;
  const days = validation.ok ? validation.days : 0;
  const rental = days * car.pricePerDay;
  const showError = !validation.ok && validation.code !== "incomplete";

  const reserveHref = ok
    ? `/cars/${car.slug}/reserve?${new URLSearchParams({
        pickupDate: startDate!,
        pickupTime,
        returnDate: endDate!,
        returnTime,
      })}`
    : undefined;

  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card sm:p-6">
      <p>
        <span className="font-display text-3xl font-semibold text-navy-900">{formatPrice(car.pricePerDay)}</span>
        <span className="ml-1 text-sm text-muted">per day</span>
      </p>
      <AvailabilityBadge availability={availability} hasWindow={hasWindow} className="mt-3" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rp-pickup-time" className="mb-1.5 block text-xs font-medium text-navy-700">
            Pickup
          </label>
          <p className="mb-1.5 flex min-h-[1.25rem] items-center gap-1.5 text-sm font-semibold text-navy-900">
            <CalendarIcon width={15} height={15} className="text-gold-700" />
            {startDate ? formatDate(startDate) : "Select on calendar"}
          </p>
          <select id="rp-pickup-time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} disabled={!startDate} className={selectClass}>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t} disabled={pickupDisabled(t)}>
                {formatTimeKey(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rp-return-time" className="mb-1.5 block text-xs font-medium text-navy-700">
            Return
          </label>
          <p className="mb-1.5 flex min-h-[1.25rem] items-center gap-1.5 text-sm font-semibold text-navy-900">
            <CalendarIcon width={15} height={15} className="text-gold-700" />
            {endDate ? formatDate(endDate) : "Select on calendar"}
          </p>
          <select id="rp-return-time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} disabled={!endDate} className={selectClass}>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t} disabled={returnDisabled(t)}>
                {formatTimeKey(t)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div aria-live="polite">
        {showError ? (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-3 py-2.5 text-sm text-[#8E1D17]">
            <AlertIcon width={17} height={17} className="mt-0.5 shrink-0" />
            {validation.message}
          </p>
        ) : null}
      </div>

      {ok ? (
        <dl className="mt-5 space-y-2 border-t border-navy-900/10 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-navy-700">
              {formatPrice(car.pricePerDay)} × {days} {days === 1 ? "day" : "days"}
            </dt>
            <dd className="font-medium text-navy-900">{formatPrice(rental)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-navy-700">Refundable deposit</dt>
            <dd className="font-medium text-navy-900">{formatPrice(car.depositAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-navy-900/10 pt-3 text-base">
            <dt className="font-semibold text-navy-900">Estimated rental</dt>
            <dd className="font-display font-semibold text-navy-900">{formatPrice(rental)}</dd>
          </div>
        </dl>
      ) : null}

      {reserveHref ? (
        <Button href={reserveHref} size="lg" className="mt-5 w-full">
          Reserve Now
        </Button>
      ) : (
        <Button size="lg" className="mt-5 w-full" disabled>
          Reserve Now
        </Button>
      )}
      <p className="mt-3 text-center text-xs text-muted">
        {ok ? "You won't be charged yet. Payment comes in the next step." : "Pick valid dates to reserve."}
      </p>
    </div>
  );
}
