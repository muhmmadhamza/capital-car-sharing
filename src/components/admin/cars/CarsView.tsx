"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CarIcon, ClockIcon } from "@/components/ui/Icons";
import { NO_CAR_FILTERS, PAGE_SIZE, carFiltersActive, filterCars, type CarFilters } from "@/features/admin/filters";
import { CAR_LIST_STATUS_LABELS, CAR_STATUS_LABELS, carAvailability, carListStatus, carListTone, carTone } from "@/features/admin/status";
import { useAsync } from "@/hooks/useAsync";
import { getCars } from "@/services/admin/car.service";
import { formatPrice } from "@/lib/utils";
import type { AdminCarListStatus, AdminCarView } from "@/types/admin";
import { BODY_TYPE_LABELS, type CarBodyType } from "@/types/car";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { ClearFiltersButton, FilterSelect, SearchInput, type FilterOption } from "../controls";
import { EmptyState, ErrorState, LoadingRows, Meta, PageHeader, Pagination, RowActions, StatCard, StatusPill, panel, type RowAction } from "../ui";
import { CarThumb } from "./CarThumb";
import { carMenu, useCarActions } from "./useCarActions";

const LIST_STATUSES: AdminCarListStatus[] = ["active", "pending", "unavailable", "suspended", "rejected"];
const isListStatus = (v: string | null): v is AdminCarListStatus => LIST_STATUSES.some((s) => s === v);

const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

/** Unique {value,label} pairs, sorted by label. */
function optionsFrom<T>(rows: T[], value: (r: T) => string, label: (r: T) => string): FilterOption[] {
  const map = new Map<string, string>();
  rows.forEach((r) => map.set(value(r), label(r)));
  return Array.from(map, ([v, l]) => ({ value: v, label: l })).sort((a, b) => a.label.localeCompare(b.label));
}

export function CarsView() {
  const params = useSearchParams();
  const initialStatus = params.get("status");
  const { data, loading, error, reload } = useAsync(getCars, []);

  const [filters, setFilters] = useState<CarFilters>({ ...NO_CAR_FILTERS, status: isListStatus(initialStatus) ? initialStatus : "all" });
  const [page, setPage] = useState(1);
  // Edits are layered on top of the loaded list so every click shows up at once.
  const [patches, setPatches] = useState<Record<string, Partial<AdminCarView>>>({});
  const [removed, setRemoved] = useState<string[]>([]);

  useEffect(() => {
    setPatches({});
    setRemoved([]);
  }, [data]);

  const rows = useMemo(() => (data ?? []).filter((c) => !removed.includes(c.id)).map((c) => ({ ...c, ...patches[c.id] })), [data, patches, removed]);
  const filtered = useMemo(() => filterCars(rows, filters), [rows, filters]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = carFiltersActive(filters);

  const counts = useMemo(() => {
    const by = (s: AdminCarListStatus) => rows.filter((c) => carListStatus(c) === s).length;
    return { total: rows.length, active: by("active"), pending: by("pending"), suspended: by("suspended") };
  }, [rows]);

  const partnerOptions = useMemo(() => optionsFrom(rows, (c) => c.partnerId, (c) => c.partnerName), [rows]);
  const locationOptions = useMemo(() => optionsFrom(rows, (c) => c.locationId, (c) => c.locationName), [rows]);
  const typeOptions: FilterOption[] = (Object.keys(BODY_TYPE_LABELS) as CarBodyType[]).map((t) => ({ value: t, label: BODY_TYPE_LABELS[t] }));
  const statusOptions: FilterOption[] = LIST_STATUSES.map((s) => ({ value: s, label: CAR_LIST_STATUS_LABELS[s] }));

  const set = <K extends keyof CarFilters>(key: K, value: CarFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };
  const clear = () => {
    setFilters(NO_CAR_FILTERS);
    setPage(1);
  };

  const actions = useCarActions({
    apply: (id, patch) =>
      setPatches((prev) => {
        const next = { ...prev };
        if (patch) next[id] = { ...next[id], ...patch };
        else delete next[id];
        return next;
      }),
    onDeleted: (id) => setRemoved((prev) => [...prev, id]),
  });

  const menuFor = (c: AdminCarView) =>
    carMenu(c, {
      edit: () => actions.requestEdit(c),
      approve: () => actions.approve(c),
      reject: () => actions.requestReject(c),
      suspend: () => actions.requestSuspend(c),
      activate: () => actions.activate(c),
      remove: () => actions.requestDelete(c),
    });
  const primaryFor = (c: AdminCarView): RowAction => ({ label: "View", href: `/admin/cars/${c.id}` });
  const nameFor = (c: AdminCarView) => `${c.make} ${c.model}`;

  return (
    <>
      <PageHeader title="Cars" description="Review new listings, approve or reject cars, and suspend or remove them when needed." />

      {data ? (
        <section aria-label="Car summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total cars" value={counts.total} icon={CarIcon} />
          <StatCard label="Active" value={counts.active} icon={CheckCircleIcon} />
          <StatCard label="Pending approval" value={counts.pending} icon={ClockIcon} hint={counts.pending > 0 ? "Waiting for your review" : undefined} />
          <StatCard label="Suspended" value={counts.suspended} icon={PauseCircleIcon} />
        </section>
      ) : null}

      <section className={panel} aria-label="Car list">
        <div className="grid gap-3 border-b border-navy-900/10 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="sm:col-span-2 xl:col-span-1">
            <SearchInput value={filters.query} placeholder="Make, model, year, partner or location" onChange={(v) => set("query", v)} />
          </div>
          <FilterSelect label="Car type" value={filters.bodyType} allLabel="All types" options={typeOptions} onChange={(v) => set("bodyType", v)} />
          <FilterSelect label="Partner" value={filters.partnerId} allLabel="All partners" options={partnerOptions} onChange={(v) => set("partnerId", v)} />
          <FilterSelect label="Status" value={filters.status} allLabel="All statuses" options={statusOptions} onChange={(v) => set("status", v as CarFilters["status"])} />
          <FilterSelect label="Location" value={filters.locationId} allLabel="All locations" options={locationOptions} onChange={(v) => set("locationId", v)} />
        </div>

        {loading && !data ? (
          <div className="p-4 sm:p-5">
            <LoadingRows label="Loading cars" />
          </div>
        ) : error && !data ? (
          <div className="p-4 sm:p-5">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtering ? "No cars match your filters" : "No cars yet"}
            text={filtering ? "Try a different search, or clear the filters to see every car." : "Cars appear here as soon as partners list them."}
            action={filtering ? <ClearFiltersButton onClick={clear} /> : undefined}
          />
        ) : (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {filtered.length} car{filtered.length === 1 ? "" : "s"} found
            </p>

            {/* Wide screens: table */}
            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-[62rem]">
                <caption className="sr-only">Cars</caption>
                <thead className="bg-navy-900/[0.03]">
                  <tr>
                    <th scope="col" className={th}>Car</th>
                    <th scope="col" className={th}>Partner</th>
                    <th scope="col" className={th}>Location</th>
                    <th scope="col" className={th}>Daily price</th>
                    <th scope="col" className={th}>Availability</th>
                    <th scope="col" className={th}>Car status</th>
                    <th scope="col" className={`${th} text-right`}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {visible.map((c) => {
                    const availability = carAvailability(c);
                    const status = carListStatus(c);
                    return (
                      <tr key={c.id} className="hover:bg-navy-900/[0.02]">
                        <td className={td}>
                          <Link href={`/admin/cars/${c.id}`} className="flex items-center gap-3 hover:text-gold-700">
                            <CarThumb car={c} />
                            <span className="min-w-0">
                              <span className="block truncate font-semibold">{nameFor(c)}</span>
                              <span className="block text-xs text-muted">{c.year} · {BODY_TYPE_LABELS[c.bodyType]}</span>
                            </span>
                          </Link>
                        </td>
                        <td className={td}>
                          <Link href={`/admin/partners/${c.partnerId}`} className="block max-w-[11rem] truncate hover:text-gold-700" title={c.partnerName}>{c.partnerName}</Link>
                        </td>
                        <td className={td}><span className="block max-w-[10rem] truncate" title={c.locationName}>{c.locationName}</span></td>
                        <td className={`${td} whitespace-nowrap font-semibold`}>{formatPrice(c.dailyPrice)}</td>
                        <td className={td}><StatusPill tone={carTone(availability)}>{CAR_STATUS_LABELS[availability]}</StatusPill></td>
                        <td className={td}><StatusPill tone={carListTone(status)}>{CAR_LIST_STATUS_LABELS[status]}</StatusPill></td>
                        <td className={`${td} text-right`}>
                          <div className="flex justify-end">
                            <RowActions name={nameFor(c)} primary={primaryFor(c)} actions={menuFor(c)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Narrower screens: stacked cards */}
            <ul className="divide-y divide-navy-900/10 xl:hidden">
              {visible.map((c) => {
                const availability = carAvailability(c);
                const status = carListStatus(c);
                return (
                  <li key={c.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/cars/${c.id}`} className="flex min-w-0 items-center gap-3">
                        <CarThumb car={c} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-navy-900">{nameFor(c)}</span>
                          <span className="block text-sm text-muted">{c.year} · {BODY_TYPE_LABELS[c.bodyType]}</span>
                        </span>
                      </Link>
                      <StatusPill tone={carListTone(status)}>{CAR_LIST_STATUS_LABELS[status]}</StatusPill>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                      <Meta label="Partner" value={<Link href={`/admin/partners/${c.partnerId}`} className="hover:text-gold-700">{c.partnerName}</Link>} />
                      <Meta label="Location" value={c.locationName} />
                      <Meta label="Daily price" value={formatPrice(c.dailyPrice)} />
                      <Meta label="Availability" value={<StatusPill tone={carTone(availability)}>{CAR_STATUS_LABELS[availability]}</StatusPill>} />
                    </dl>
                    <div className="mt-4 flex">
                      <RowActions name={nameFor(c)} primary={primaryFor(c)} actions={menuFor(c)} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </section>

      {actions.dialogs}
    </>
  );
}
