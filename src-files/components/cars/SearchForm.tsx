"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CalendarIcon, ClockIcon, PinIcon, SearchIcon } from "@/components/ui/Icons";
import { combine, dateOf, formatTimeKey, nowWall, TIME_SLOTS } from "@/lib/date";
import { RENTAL_RULES } from "@/features/availability";
import { DEFAULT_PICKUP_TIME, type WindowFields } from "@/features/cars/search-params";

const inputClass =
  "h-12 w-full rounded-lg border border-navy-900/20 bg-white pl-11 pr-3 text-base text-ink placeholder:text-muted/80 transition-colors hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60";

function Icon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-700">{children}</span>;
}

type Props = {
  location?: string;
  fields?: Partial<WindowFields>;
  /** Locations offered as suggestions in the pickup field. */
  locationNames: string[];
  /** Existing filter params, carried over so a new search keeps the filters. */
  carry?: Record<string, string[]>;
};

/**
 * Search form shared by the landing page and /cars. It works without JavaScript
 * as a plain GET form to /cars; with JavaScript it validates first and then
 * navigates client-side. Field names double as the URL parameter names.
 */
export function SearchForm({ location = "", fields, locationNames, carry = {} }: Props) {
  const router = useRouter();
  const uid = useId();
  const [error, setError] = useState<string | null>(null);
  const [minDate, setMinDate] = useState<string | undefined>(undefined);

  // Computed after mount so the server and first client render match.
  useEffect(() => setMinDate(dateOf(nowWall())), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const pickupDate = get("pickupDate");
    const returnDate = get("returnDate");

    if (!!pickupDate !== !!returnDate) {
      setError("Choose both a pickup and a return date, or leave both empty to browse every car.");
      return;
    }
    if (pickupDate && returnDate) {
      const pickup = combine(pickupDate, get("pickupTime") || DEFAULT_PICKUP_TIME);
      const ret = combine(returnDate, get("returnTime") || DEFAULT_PICKUP_TIME);
      if (pickup < nowWall()) return setError("Pickup must be in the future.");
      if (ret <= pickup) return setError("Return must be after pickup.");
      const hours = (Date.parse(`${ret}:00Z`) - Date.parse(`${pickup}:00Z`)) / 3_600_000;
      if (hours < RENTAL_RULES.minHours) return setError(`Rentals start at ${RENTAL_RULES.minHours} hours.`);
      if (hours > RENTAL_RULES.maxDays * 24) return setError(`Rentals can be up to ${RENTAL_RULES.maxDays} days.`);
    }

    setError(null);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      const v = String(value).trim();
      if (!v || key.startsWith("$")) continue;
      // Times only mean something alongside dates.
      if ((key === "pickupTime" || key === "returnTime") && !pickupDate) continue;
      params.append(key, v);
    }
    router.push(`/cars${params.size ? `?${params}` : ""}`);
  }

  const listId = `${uid}-locations`;
  const timeSelect = (name: string, id: string, value: string, label: string) => (
    <div className="relative w-[8.75rem] shrink-0">
      <Icon>
        <ClockIcon width={18} height={18} />
      </Icon>
      <select id={id} name={name} defaultValue={value} aria-label={label} className={`${inputClass} appearance-none !pl-10 !pr-2 !text-sm`}>
        {TIME_SLOTS.map((t) => (
          <option key={t} value={t}>
            {formatTimeKey(t)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form action="/cars" method="get" onSubmit={handleSubmit} noValidate>
      {/* Keep current filters when searching again (also works without JS). */}
      {Object.entries(carry).flatMap(([k, vs]) => vs.map((v) => <input key={`${k}-${v}`} type="hidden" name={k} value={v} />))}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1.3fr_1.3fr_auto] xl:items-end">
        <div>
          <label htmlFor={`${uid}-loc`} className="mb-1.5 block text-sm font-medium text-navy-900">
            Pickup location
          </label>
          <div className="relative">
            <Icon>
              <PinIcon width={19} height={19} />
            </Icon>
            <input
              id={`${uid}-loc`}
              name="location"
              type="text"
              list={listId}
              autoComplete="off"
              defaultValue={location}
              placeholder="City, area or airport"
              className={inputClass}
            />
            <datalist id={listId}>
              {locationNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-navy-900">Pickup date and time</legend>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Icon>
                <CalendarIcon width={18} height={18} />
              </Icon>
              <input
                id={`${uid}-pd`}
                name="pickupDate"
                type="date"
                min={minDate}
                defaultValue={fields?.pickupDate}
                aria-label="Pickup date"
                className={`${inputClass} !pl-10 !pr-1.5 !text-sm`}
              />
            </div>
            {timeSelect("pickupTime", `${uid}-pt`, fields?.pickupTime ?? DEFAULT_PICKUP_TIME, "Pickup time")}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-navy-900">Return date and time</legend>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Icon>
                <CalendarIcon width={18} height={18} />
              </Icon>
              <input
                id={`${uid}-rd`}
                name="returnDate"
                type="date"
                min={minDate}
                defaultValue={fields?.returnDate}
                aria-label="Return date"
                className={`${inputClass} !pl-10 !pr-1.5 !text-sm`}
              />
            </div>
            {timeSelect("returnTime", `${uid}-rt`, fields?.returnTime ?? DEFAULT_PICKUP_TIME, "Return time")}
          </div>
        </fieldset>

        <Button type="submit" size="lg" className="w-full md:col-span-2 xl:col-span-1 xl:w-auto">
          <SearchIcon width={19} height={19} />
          Search Cars
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-medium text-[#8E1D17]">
          <AlertIcon width={18} height={18} className="mt-px shrink-0" />
          {error}
        </p>
      ) : null}
    </form>
  );
}
