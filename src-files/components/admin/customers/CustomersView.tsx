"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { EditIcon, ListIcon, SearchIcon } from "@/components/ui/Icons";
import { SelectField } from "@/components/ui/FormControls";
import { CUSTOMER_STATUS_LABELS, customerTone } from "@/features/admin/status";
import { PAGE_SIZE, filterCustomers } from "@/features/admin/filters";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { getCustomers } from "@/services/admin/customer.service";
import type { AdminCustomerRow, CustomerStatus } from "@/types/admin";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { EmptyState, ErrorState, LoadingRows, Meta, PageHeader, Pagination, RowActions, StatusPill, panel, type RowAction } from "../ui";
import { useCustomerActions } from "./useCustomerActions";

type StatusFilter = CustomerStatus | "all";

const isStatusFilter = (v: string | null): v is CustomerStatus => v === "active" || v === "inactive";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

export function CustomersView() {
  const params = useSearchParams();
  const initial = params.get("status");
  const { data, loading, error, reload } = useAsync(getCustomers, []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(isStatusFilter(initial) ? initial : "all");
  const [page, setPage] = useState(1);
  // Edits are layered on top of the loaded list so a click shows up at once.
  const [patches, setPatches] = useState<Record<string, Partial<AdminCustomerRow>>>({});

  useEffect(() => setPatches({}), [data]);

  const rows = useMemo(() => (data ?? []).map((c) => ({ ...c, ...patches[c.id] })), [data, patches]);
  const filtered = useMemo(() => filterCustomers(rows, query, status), [rows, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = query.trim() !== "" || status !== "all";

  const actions = useCustomerActions({
    apply: (id, patch) =>
      setPatches((prev) => {
        const next = { ...prev };
        if (patch) next[id] = { ...next[id], ...patch };
        else delete next[id];
        return next;
      }),
    applyRow: (row) => setPatches((prev) => ({ ...prev, [row.id]: row })),
  });

  function actionsFor(c: AdminCustomerRow): { primary: RowAction; menu: RowAction[] } {
    return {
      primary: { label: "View", href: `/admin/customers/${c.id}` },
      menu: [
        { label: "Edit customer", icon: EditIcon, onClick: () => actions.edit(c) },
        c.status === "active"
          ? { label: "Deactivate", icon: PauseCircleIcon, tone: "danger", onClick: () => actions.requestDeactivate(c) }
          : { label: "Activate", icon: CheckCircleIcon, onClick: () => actions.activate(c) },
        { label: "View reservations", icon: ListIcon, href: `/admin/customers/${c.id}#reservations` },
      ],
    };
  }

  return (
    <>
      <PageHeader title="Customers" description="Search customer accounts, update their details and control who can rent." />

      <section className={panel} aria-label="Customer list">
        <div className="grid gap-3 border-b border-navy-900/10 p-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:p-5">
          <div>
            <label htmlFor="customer-search" className="mb-1.5 block text-sm font-medium text-navy-900">
              Search
            </label>
            <div className="relative">
              <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="customer-search"
                type="search"
                value={query}
                placeholder="Name, email or phone"
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full rounded-lg border border-navy-900/20 bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/80 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
              />
            </div>
          </div>
          <SelectField
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectField>
        </div>

        {loading && !data ? (
          <div className="p-4 sm:p-5">
            <LoadingRows label="Loading customers" />
          </div>
        ) : error && !data ? (
          <div className="p-4 sm:p-5">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtering ? "No customers match your filters" : "No customers yet"}
            text={filtering ? "Try a different name, email or phone number, or clear the status filter." : "Customer accounts will appear here once people register."}
            action={
              filtering ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setPage(1);
                  }}
                  className="inline-flex h-11 items-center rounded-lg border border-navy-900/30 px-5 text-sm font-semibold text-navy-900 hover:border-navy-900 hover:bg-navy-900/5"
                >
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="sr-only" role="status" aria-live="polite">
              {filtered.length} customer{filtered.length === 1 ? "" : "s"} found
            </p>

            {/* Wide screens: table */}
            <div className="hidden xl:block">
              <table className="w-full table-fixed">
                <caption className="sr-only">Customers</caption>
                <thead className="bg-navy-900/[0.03]">
                  <tr>
                    <th scope="col" className={`${th} w-[22%]`}>Customer</th>
                    <th scope="col" className={`${th} w-[22%]`}>Email</th>
                    <th scope="col" className={`${th} w-[14%]`}>Phone</th>
                    <th scope="col" className={`${th} w-[12%]`}>Registered</th>
                    <th scope="col" className={`${th} w-[8%]`}>Reservations</th>
                    <th scope="col" className={`${th} w-[10%]`}>Status</th>
                    <th scope="col" className={`${th} w-[12%] text-right`}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {visible.map((c) => {
                    const { primary, menu } = actionsFor(c);
                    return (
                      <tr key={c.id} className="hover:bg-navy-900/[0.02]">
                        <td className={td}>
                          <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3 font-semibold hover:text-gold-700">
                            <Avatar name={c.name} className="h-9 w-9 text-xs" />
                            <span className="truncate">{c.name}</span>
                          </Link>
                        </td>
                        <td className={td}><span className="block truncate" title={c.email}>{c.email}</span></td>
                        <td className={`${td} whitespace-nowrap`}>{c.phone}</td>
                        <td className={`${td} whitespace-nowrap`}>{formatIsoDate(c.createdAt)}</td>
                        <td className={`${td} text-center`}>{c.reservationCount}</td>
                        <td className={td}><StatusPill tone={customerTone(c.status)}>{CUSTOMER_STATUS_LABELS[c.status]}</StatusPill></td>
                        <td className={`${td} text-right`}>
                          <div className="flex justify-end">
                            <RowActions name={c.name} primary={primary} actions={menu} />
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
                const { primary, menu } = actionsFor(c);
                return (
                  <li key={c.id} className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/customers/${c.id}`} className="flex min-w-0 items-center gap-3">
                        <Avatar name={c.name} className="h-11 w-11" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-navy-900">{c.name}</span>
                          <span className="block truncate text-sm text-muted">{c.email}</span>
                        </span>
                      </Link>
                      <StatusPill tone={customerTone(c.status)}>{CUSTOMER_STATUS_LABELS[c.status]}</StatusPill>
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                      <Meta label="Phone" value={c.phone} />
                      <Meta label="Registered" value={formatIsoDate(c.createdAt)} />
                      <Meta label="Reservations" value={String(c.reservationCount)} />
                    </dl>
                    <div className="mt-4 flex">
                      <RowActions name={c.name} primary={primary} actions={menu} />
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
