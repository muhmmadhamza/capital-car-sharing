"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BODY_TYPE_LABELS } from "@/types/car";
import type { CarSearchQuery } from "@/types/search";
import { BODY_TYPES, FUEL_TYPES, PRICE_RANGE, SEAT_OPTIONS, TRANSMISSIONS } from "@/features/cars/search-params";
import { FilterIcon } from "@/components/ui/Icons";

type Params = Record<string, string[]>;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-navy-900/10 py-5 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-sm font-semibold text-navy-900">{title}</legend>
      {children}
    </fieldset>
  );
}

const optionClass = "flex cursor-pointer items-center gap-3 py-1.5 text-sm text-navy-700";
const controlClass = "h-4 w-4 accent-[#0B1B33]";
const numberClass =
  "h-11 w-full rounded-lg border border-navy-900/20 bg-white px-3 text-sm text-ink hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60";

/**
 * Filters are URL state: every change rewrites the query string and the server
 * re-renders the results. That keeps results shareable and the same code path
 * works when the data comes from the API.
 */
export function FilterPanel({ params, query, resultCount }: { params: Params; query: CarSearchQuery; resultCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const f = query.filters;

  function push(next: Params) {
    const sp = new URLSearchParams();
    for (const [k, vs] of Object.entries(next)) vs.forEach((v) => v !== "" && sp.append(k, v));
    router.replace(`/cars${sp.size ? `?${sp}` : ""}`, { scroll: false });
  }
  const set = (key: string, value: string | null) => {
    const next = { ...params };
    if (value === null || value === "") delete next[key];
    else next[key] = [value];
    push(next);
  };
  const toggle = (key: string, value: string) => {
    const current = params[key] ?? [];
    const next = { ...params };
    const list = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (list.length) next[key] = list;
    else delete next[key];
    push(next);
  };

  function submitPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = { ...params };
    for (const key of ["minPrice", "maxPrice"]) {
      const v = String(data.get(key) ?? "").trim();
      if (v) next[key] = [v];
      else delete next[key];
    }
    push(next);
  }

  const activeCount =
    f.bodyTypes.length +
    f.fuels.length +
    (f.transmission ? 1 : 0) +
    (f.minSeats !== undefined ? 1 : 0) +
    (f.minPrice !== undefined || f.maxPrice !== undefined ? 1 : 0) +
    (query.availableOnly ? 1 : 0);

  const clearHref = (() => {
    const sp = new URLSearchParams();
    for (const k of ["location", "pickupDate", "pickupTime", "returnDate", "returnTime"]) (params[k] ?? []).forEach((v) => sp.append(k, v));
    return `/cars${sp.size ? `?${sp}` : ""}`;
  })();

  return (
    <aside aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="car-filters"
        className="flex h-12 w-full items-center justify-between rounded-lg border border-navy-900/20 bg-white px-4 text-sm font-semibold text-navy-900 lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <FilterIcon width={18} height={18} className="text-gold-700" />
          Filters{activeCount ? ` (${activeCount})` : ""}
        </span>
        <span className="text-muted">{open ? "Hide" : "Show"}</span>
      </button>

      <div
        id="car-filters"
        className={cn(
          "mt-3 rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card lg:mt-0 lg:block",
          open ? "block" : "hidden",
        )}
      >
        <div className="mb-4 flex items-center justify-between lg:mb-5">
          <h2 className="text-lg font-semibold text-navy-900">Filters</h2>
          {activeCount ? (
            <button type="button" onClick={() => router.replace(clearHref, { scroll: false })} className="text-sm font-medium text-gold-700 underline underline-offset-2 hover:text-navy-900">
              Clear all
            </button>
          ) : null}
        </div>

        <Group title="Availability">
          <label className={optionClass}>
            <input
              type="checkbox"
              className={controlClass}
              checked={query.availableOnly}
              onChange={() => set("availableOnly", query.availableOnly ? null : "1")}
            />
            Only show available cars
          </label>
        </Group>

        <Group title="Car type">
          {BODY_TYPES.map((t) => (
            <label key={t} className={optionClass}>
              <input type="checkbox" className={controlClass} checked={f.bodyTypes.includes(t)} onChange={() => toggle("type", t)} />
              {BODY_TYPE_LABELS[t]}
            </label>
          ))}
        </Group>

        <Group title="Daily price">
          <form onSubmit={submitPrice} key={`${f.minPrice ?? ""}-${f.maxPrice ?? ""}`}>
            <div className="flex items-center gap-2">
              <input
                name="minPrice"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={`Min ${PRICE_RANGE.min}`}
                aria-label="Minimum daily price"
                defaultValue={f.minPrice}
                onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                className={numberClass}
              />
              <span className="text-muted" aria-hidden="true">
                –
              </span>
              <input
                name="maxPrice"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={`Max ${PRICE_RANGE.max}`}
                aria-label="Maximum daily price"
                defaultValue={f.maxPrice}
                onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                className={numberClass}
              />
            </div>
            <button type="submit" className="sr-only">
              Apply price
            </button>
          </form>
        </Group>

        <Group title="Seats">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Minimum seats">
            {[undefined, ...SEAT_OPTIONS].map((n) => {
              const selected = f.minSeats === n;
              return (
                <button
                  key={n ?? "any"}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set("minSeats", n === undefined ? null : String(n))}
                  className={cn(
                    "h-10 min-w-[3.25rem] rounded-lg border px-3 text-sm font-medium transition-colors",
                    selected ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20 text-navy-700 hover:border-navy-900/50",
                  )}
                >
                  {n === undefined ? "Any" : `${n}+`}
                </button>
              );
            })}
          </div>
        </Group>

        <Group title="Transmission">
          {[undefined, ...TRANSMISSIONS].map((t) => (
            <label key={t ?? "any"} className={optionClass}>
              <input
                type="radio"
                name="transmission"
                className={controlClass}
                checked={f.transmission === t}
                onChange={() => set("transmission", t ?? null)}
              />
              {t ?? "Any"}
            </label>
          ))}
        </Group>

        <Group title="Fuel type">
          {FUEL_TYPES.map((t) => (
            <label key={t} className={optionClass}>
              <input type="checkbox" className={controlClass} checked={f.fuels.includes(t)} onChange={() => toggle("fuel", t)} />
              {t}
            </label>
          ))}
        </Group>

        <p className="sr-only" aria-live="polite">
          {resultCount} cars match
        </p>
      </div>
    </aside>
  );
}
