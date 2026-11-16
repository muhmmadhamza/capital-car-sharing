"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { CarIcon, ListIcon, SearchIcon } from "@/components/ui/Icons";
import { SelectField } from "@/components/ui/FormControls";
import { PAGE_SIZE, filterPartners } from "@/features/admin/filters";
import { PARTNER_STATUS_LABELS, partnerTone } from "@/features/admin/status";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { getPartners } from "@/services/admin/partner.service";
import type { AdminPartnerRow, PartnerStatus } from "@/types/admin";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { EmptyState, ErrorState, LoadingRows, Meta, PageHeader, Pagination, RowActions, StatusPill, panel, type RowAction } from "../ui";
import { usePartnerActions } from "./usePartnerActions";

type StatusFilter = PartnerStatus | "all";

const isStatusFilter = (v: string | null): v is PartnerStatus => v === "active" || v === "pending" || v === "suspended";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

/** The actions that make sense for a partner's current status. Shared with the partner page. */
export function partnerMenu(
  p: Pick<AdminPartnerRow, "id" | "status">,
  a: { approve: () => void; suspend: () => void; activate: () => void },
): RowAction[] {
  const menu: RowAction[] = [];
  if (p.status === "pending") menu.push({ label: "Approve", icon: CheckCircleIcon, onClick: a.approve });
  if (p.status === "suspended") menu.push({ label: "Activate", icon: CheckCircleIcon, onClick: a.activate });
  if (p.status !== "suspended") menu.push({ label: "Suspend", icon: PauseCircleIcon, tone: "danger", onClick: a.suspend });
  menu.push({ label: "View cars", icon: CarIcon, href: `/admin/partners/${p.id}#cars` });
  menu.push({ label: "View reservations", icon: ListIcon, href: `/admin/partners/${p.id}#reservations` });
  return menu;
}

export function PartnersView() {
  const params = useSearchParams();
  const initial = params.get("status");
  const { data, loading, error, reload } = useAsync(getPartners, []);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>(isStatusFilter(initial) ? initial : "all");
  const [page, setPage] = useState(1);
  // Edits are layered on top of the loaded list so a click shows up at once.
  const [patches, setPatches] = useState<Record<string, Partial<AdminPartnerRow>>>({});

  useEffect(() => setPatches({}), [data]);

  const rows = useMemo(() => (data ?? []).map((p) => ({ ...p, ...patches[p.id] })), [data, patches]);
  const filtered = useMemo(() => filterPartners(rows, query, status), [rows, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtering = query.trim() !== "" || status !== "all";

  const actions = usePartnerActions({
    apply: (id, patch) =>
      setPatches((prev) => {
        const next = { ...prev };
        if (patch) next[id] = { ...next[id], ...patch };
        else delete next[id];
        return next;
      }),
  });

  const menuFor = (p: AdminPartnerRow) => partnerMenu(p, { approve: () => actions.approve(p), suspend: () => actions.requestSuspend(p), activate: () => actions.activate(p) });
  const primaryFor = (p: AdminPartnerRow): RowAction => ({ label: "View", href: `/admin/partners/${p.id}` });

  return (
    <>
      <PageHeader title="Partners" description="Review partner sign-ups, approve new businesses and suspend accounts when needed." />

      <section className={panel} aria-label="Partner list">
        <div className="grid gap-3 border-b border-navy-900/10 p-4 sm:grid-cols-[minmax(0,1fr)_14rem] sm:p-5">
          <div>
            <label htmlFor="partner-search" className="mb-1.5 block text-sm font-medium text-navy-900">
              Search
            </label>
            <div className="relative">
              <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="partner-search"
                type="search"
                value={query}
                placeholder="Name, company, email or phone"
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
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </SelectField>
        </div>

        {loading && !data ? (
          <div className="p-4 sm:p-5">
            <LoadingRows label="Loading partners" />
          </div>
        ) : error && !data ? (
          <div className="p-4 sm:p-5">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filtering ? "No partners match your filters" : "No partners yet"}
            text={filtering ? "Try a different name, company, email or phone number, or clear the status filter." : "Partner accounts will appear here once businesses sign up."}
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
              {filtered.length} partner{filtered.length === 1 ? "" : "s"} found
            </p>

            {/* Wide screens: table */}
            <div className="hidden xl:block">
              <table className="w-full table-fixed">
                <caption className="sr-only">Partners</caption>
                <thead className="bg-navy-900/[0.03]">
                  <tr>
                    <th scope="col" className={`${th} w-[15%]`}>Partner</th>
                    <th scope="col" className={`${th} w-[16%]`}>Company</th>
                    <th scope="col" className={`${th} w-[19%]`}>Email / phone</th>
                    <th scope="col" className={`${th} w-[6%]`}>Cars</th>
                    <th scope="col" className={`${th} w-[9%]`}>Reservations</th>
                    <th scope="col" className={`${th} w-[11%]`}>Registered</th>
                    <th scope="col" className={`${th} w-[10%]`}>Status</th>
                    <th scope="col" className={`${th} w-[14%] text-right`}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-900/10">
                  {visible.map((p) => (
                    <tr key={p.id} className="hover:bg-navy-900/[0.02]">
                      <td className={td}>
                        <Link href={`/admin/partners/${p.id}`} className="flex items-center gap-3 font-semibold hover:text-gold-700">
                          <Avatar name={p.name} className="h-9 w-9 text-xs" />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      </td>
                      <td className={td}><span className="block truncate font-medium" title={p.companyName}>{p.companyName}</span></td>
                      <td className={td}>
                        <span className="block truncate" title={p.email}>{p.email}</span>
                        <span className="block truncate text-xs text-muted">{p.phone}</span>
                      </td>
                      <td className={`${td} text-center`}>{p.carCount}</td>
                      <td className={`${td} text-center`}>{p.reservationCount}</td>
                      <td className={`${td} whitespace-nowrap`}>{formatIsoDate(p.createdAt)}</td>
                      <td className={td}><StatusPill tone={partnerTone(p.status)}>{PARTNER_STATUS_LABELS[p.status]}</StatusPill></td>
                      <td className={`${td} text-right`}>
                        <div className="flex justify-end">
                          <RowActions name={p.companyName} primary={primaryFor(p)} actions={menuFor(p)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Narrower screens: stacked cards */}
            <ul className="divide-y divide-navy-900/10 xl:hidden">
              {visible.map((p) => (
                <li key={p.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/admin/partners/${p.id}`} className="flex min-w-0 items-center gap-3">
                      <Avatar name={p.name} className="h-11 w-11" />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-navy-900">{p.companyName}</span>
                        <span className="block truncate text-sm text-muted">{p.name}</span>
                      </span>
                    </Link>
                    <StatusPill tone={partnerTone(p.status)}>{PARTNER_STATUS_LABELS[p.status]}</StatusPill>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                    <Meta label="Email" value={p.email} />
                    <Meta label="Phone" value={p.phone} />
                    <Meta label="Registered" value={formatIsoDate(p.createdAt)} />
                    <Meta label="Cars" value={String(p.carCount)} />
                    <Meta label="Reservations" value={String(p.reservationCount)} />
                  </dl>
                  <div className="mt-4 flex">
                    <RowActions name={p.companyName} primary={primaryFor(p)} actions={menuFor(p)} />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </section>

      {actions.dialogs}
    </>
  );
}
