"use client";

import { useId, type ReactNode } from "react";
import { SelectField } from "@/components/ui/FormControls";
import { inputClass } from "@/components/ui/FormField";
import { SearchIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { panel } from "./ui";

/**
 * Small building blocks shared by the Cars and Reservations screens. They sit next to ui.tsx
 * (PageHeader, StatusPill, StatCard, Modal, EmptyState, LoadingRows ...) and follow its look.
 */

export function SearchInput({ label = "Search", value, placeholder, onChange }: { label?: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <div className="relative">
        <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-navy-900/20 bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/80 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
        />
      </div>
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

/** A labelled dropdown with an "All ..." first option. */
export function FilterSelect({ label, value, allLabel, options, onChange }: { label: string; value: string; allLabel: string; options: FilterOption[]; onChange: (value: string) => void }) {
  return (
    <SelectField label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </SelectField>
  );
}

export function DateFilter({ label, value, min, max, onChange }: { label: string; value: string; min?: string; max?: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <input id={id} type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "border-navy-900/20")} />
    </div>
  );
}

export function ClearFiltersButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("inline-flex h-11 items-center rounded-lg border border-navy-900/30 px-5 text-sm font-semibold text-navy-900 hover:border-navy-900 hover:bg-navy-900/5", className)}
    >
      Clear filters
    </button>
  );
}

/** Titled white card. The same shell the detail pages use for every group of facts. */
export function AdminCard({ title, description, action, children, id, className }: { title: string; description?: string; action?: ReactNode; children: ReactNode; id?: string; className?: string }) {
  const headingId = useId();
  return (
    <section id={id} aria-labelledby={headingId} className={cn(panel, "scroll-mt-24 p-5 sm:p-6", className)}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-semibold text-navy-900">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
