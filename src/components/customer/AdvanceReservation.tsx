"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { CarImageView } from "@/components/cars/CarImageView";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CalendarIcon, ClockIcon, FuelIcon, GearIcon, PinIcon, SearchIcon, SeatIcon } from "@/components/ui/Icons";
import { RENTAL_RULES } from "@/features/availability/rules";
import { DEFAULT_PICKUP_TIME } from "@/features/cars/search-params";
import { advanceFieldsError, earliestAdvanceDate, type AdvanceFields } from "@/features/reservations/advance";
import { addDays, combine, dateOf, formatDate, formatTimeKey, nowWall, rentalDays, TIME_SLOTS } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { errorMessage } from "@/services/errors";
import { searchCars } from "@/services/cars";
import type { CarListing } from "@/types/car";
import type { CarSearchQuery } from "@/types/search";
import { AdvanceBadge } from "./AdvanceBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader, panel } from "./States";

const field =
  "h-11 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-sm text-ink hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60";

const NO_FILTERS: CarSearchQuery["filters"] = { bodyTypes: [], fuels: [] };

type Result = { fields: AdvanceFields; cars: CarListing[] };

/**
 * Reserve Ahead. The customer picks future dates and sees only the cars that are free for ALL of them. The list comes
 * from the existing car search (GET /cars with bookingType=advance), so availability is the API's, read live from
 * PostgreSQL. "Reserve" opens the existing checkout, where the API re-checks availability, verification and price.
 */
export function AdvanceReservation() {
  const uid = useId();
  const [fields, setFields] = useState<AdvanceFields>({ pickupDate: "", pickupTime: DEFAULT_PICKUP_TIME, returnDate: "", returnTime: DEFAULT_PICKUP_TIME });
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [state, setState] = useState<{ status: "idle" | "loading" | "error" | "done"; result?: Result; error?: string }>({ status: "idle" });
  // Computed after mount so the server and first client render match.
  const [minDate, setMinDate] = useState<string>();
  useEffect(() => setMinDate(earliestAdvanceDate(nowWall())), []);

  const set = (patch: Partial<AdvanceFields>) => setFields((f) => ({ ...f, ...patch }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const now = nowWall();
    const problem = advanceFieldsError(fields, now);
    if (problem) return setFormError(problem);
    setFormError(null);
    setState({ status: "loading" });
    try {
      const cars = await searchCars({
        location: location.trim(),
        window: { pickup: combine(fields.pickupDate, fields.pickupTime), return: combine(fields.returnDate, fields.returnTime) },
        filters: NO_FILTERS,
        sort: "price-asc",
        availableOnly: true,
        advance: true,
      });
      setState({ status: "done", result: { fields: { ...fields }, cars } });
    } catch (e) {
      setState({ status: "error", error: errorMessage(e) });
    }
  }

  const select = (id: string, label: string, value: string, onChange: (v: string) => void) => (
    <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={field}>
      {TIME_SLOTS.map((t) => (
        <option key={t} value={t}>
          {formatTimeKey(t)}
        </option>
      ))}
    </select>
  );

  const maxDate = addDays(dateOf(nowWall()), RENTAL_RULES.maxAdvanceDays);

  return (
    <div>
      <PageHeader
        title="Reserve Ahead"
        description={`Plan a trip for future dates. Pick your dates to see the cars that are free for all of them. Advance reservations start at least ${RENTAL_RULES.advanceMinHours} hours from now.`}
      />

      <form onSubmit={onSubmit} noValidate className={`${panel} p-5 sm:p-6`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1.2fr_auto] xl:items-end">
          <div>
            <label htmlFor={`${uid}-loc`} className="mb-1.5 block text-sm font-medium text-navy-900">
              Pickup location <span className="font-normal text-muted">(optional)</span>
            </label>
            <div className="relative">
              <PinIcon width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gold-700" />
              <input id={`${uid}-loc`} value={location} onChange={(e) => setLocation(e.target.value)} maxLength={80} placeholder="City, area or airport" className={`${field} pl-10`} />
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-navy-900">Pickup date and time</legend>
            <div className="flex gap-2">
              <input type="date" aria-label="Pickup date" min={minDate} max={maxDate} value={fields.pickupDate} onChange={(e) => set({ pickupDate: e.target.value })} className={field} />
              <div className="w-[8.5rem] shrink-0">{select(`${uid}-pt`, "Pickup time", fields.pickupTime, (v) => set({ pickupTime: v }))}</div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium text-navy-900">Return date and time</legend>
            <div className="flex gap-2">
              <input type="date" aria-label="Return date" min={fields.pickupDate || minDate} value={fields.returnDate} onChange={(e) => set({ returnDate: e.target.value })} className={field} />
              <div className="w-[8.5rem] shrink-0">{select(`${uid}-rt`, "Return time", fields.returnTime, (v) => set({ returnTime: v }))}</div>
            </div>
          </fieldset>

          <Button type="submit" size="lg" className="w-full md:col-span-2 xl:col-span-1 xl:w-auto" disabled={state.status === "loading"} aria-busy={state.status === "loading"}>
            <SearchIcon width={19} height={19} />
            {state.status === "loading" ? "Searching…" : "Find available cars"}
          </Button>
        </div>

        <div aria-live="polite">
          {formError ? (
            <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-medium text-[#8E1D17]">
              <AlertIcon width={18} height={18} className="mt-px shrink-0" />
              {formError}
            </p>
          ) : null}
        </div>
      </form>

      <div className="mt-8" role="region" aria-label="Available cars" aria-live="polite">
        {state.status === "loading" ? <LoadingBlock label="Checking availability for your dates" rows={2} /> : null}
        {state.status === "error" ? <ErrorBlock message={state.error ?? "We could not check these dates."} /> : null}
        {state.status === "done" && state.result ? <Results result={state.result} /> : null}
        {state.status === "idle" ? (
          <EmptyBlock title="Choose your dates" text="Availability is checked live against every booking, so the cars you see are free for your whole trip." />
        ) : null}
      </div>
    </div>
  );
}

function Results({ result }: { result: Result }) {
  const { fields, cars } = result;
  const pickup = combine(fields.pickupDate, fields.pickupTime);
  const ret = combine(fields.returnDate, fields.returnTime);
  const days = rentalDays(pickup, ret);
  const query = new URLSearchParams({ pickupDate: fields.pickupDate, pickupTime: fields.pickupTime, returnDate: fields.returnDate, returnTime: fields.returnTime }).toString();

  if (cars.length === 0) {
    return (
      <EmptyBlock
        title="No cars are free for these dates"
        text={`Every car is booked or blocked at some point between ${formatDate(fields.pickupDate)} and ${formatDate(fields.returnDate)}. Try shifting your dates, or another pickup location.`}
      />
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdvanceBadge bookingType="advance" />
        <h2 className="text-lg font-semibold text-navy-900">
          {cars.length} {cars.length === 1 ? "car is" : "cars are"} free from {formatDate(fields.pickupDate)} to {formatDate(fields.returnDate)}
        </h2>
      </div>
      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cars.map((car) => (
          <li key={car.id} className={`${panel} flex flex-col overflow-hidden`}>
            <div className="aspect-[16/10] overflow-hidden bg-navy-900">
              <CarImageView car={car} image={car.images[0]} />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-sm text-muted">
                {car.category}, {car.year}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-navy-900">
                {car.make} {car.model}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                <PinIcon width={15} height={15} className="text-gold-700" />
                {car.location.name}
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-navy-700">
                <li className="inline-flex items-center gap-1.5">
                  <SeatIcon width={16} height={16} className="text-gold-700" />
                  {car.seats} seats
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <GearIcon width={16} height={16} className="text-gold-700" />
                  {car.transmission}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <FuelIcon width={16} height={16} className="text-gold-700" />
                  {car.fuel}
                </li>
              </ul>
              <div className="mt-5 border-t border-navy-900/10 pt-4">
                <p className="flex items-baseline justify-between gap-3">
                  <span>
                    <span className="font-display text-2xl font-semibold text-navy-900">{formatPrice(car.pricePerDay)}</span>
                    <span className="ml-1 text-sm text-muted">per day</span>
                  </span>
                  <span className="text-right text-xs text-muted">
                    about {formatPrice(car.pricePerDay * days)}
                    <br />
                    for {days} {days === 1 ? "day" : "days"}
                  </span>
                </p>
                <Button href={`/cars/${car.slug}/reserve?${query}`} className="mt-4 w-full" aria-label={`Reserve the ${car.make} ${car.model} for these dates`}>
                  <CalendarIcon width={16} height={16} />
                  Reserve
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <ClockIcon width={14} height={14} className="text-gold-700" />
        The final price and availability are confirmed by Capital Car Sharing when you send the request.
      </p>
    </section>
  );
}
