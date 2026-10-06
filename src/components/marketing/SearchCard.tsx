"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, PinIcon, SearchIcon } from "@/components/ui/Icons";

function Field({ id, label, icon, children }: { id: string; label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-700">{icon}</span>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-lg border border-navy-900/20 bg-white pl-11 pr-3 text-base text-ink placeholder:text-muted/80 transition-colors hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60";

/**
 * UI only. Search is wired to the availability service in a later phase
 * (see docs/ARCHITECTURE.md, "Booking and availability").
 */
export function SearchCard() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section id="search" aria-label="Search cars" className="relative z-10 -mt-14 scroll-mt-24 sm:-mt-16">
      <div className="mx-auto w-full max-w-page px-5 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-search sm:p-6"
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] lg:items-end">
            <Field id="pickup-location" label="Pickup location" icon={<PinIcon width={19} height={19} />}>
              <input
                id="pickup-location"
                name="pickupLocation"
                type="text"
                autoComplete="off"
                placeholder="City, area or airport"
                className={inputClass}
              />
            </Field>

            <Field id="pickup-date" label="Pickup date" icon={<CalendarIcon width={19} height={19} />}>
              <input id="pickup-date" name="pickupDate" type="date" className={inputClass} />
            </Field>

            <Field id="return-date" label="Return date" icon={<CalendarIcon width={19} height={19} />}>
              <input id="return-date" name="returnDate" type="date" className={inputClass} />
            </Field>

            <Button type="submit" size="lg" className="w-full md:col-span-2 lg:col-span-1 lg:w-auto">
              <SearchIcon width={19} height={19} />
              Search Cars
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
