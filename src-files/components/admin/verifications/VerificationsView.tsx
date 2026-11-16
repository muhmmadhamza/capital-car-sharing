"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchIcon } from "@/components/ui/Icons";
import { VERIFICATION_LABELS, documentTypeLabel, verificationTone } from "@/features/verification/status";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { getVerifications } from "@/services/admin/verification.service";
import type { VerificationStatus } from "@/types/verification";
import { EmptyState, ErrorState, LoadingRows, Meta, PageHeader, Pagination, StatusPill, panel } from "../ui";

type Filter = Exclude<VerificationStatus, "not_submitted"> | "all";
const TABS: Filter[] = ["pending_review", "resubmission_required", "rejected", "approved", "all"];
const TAB_LABELS: Record<Filter, string> = { ...VERIFICATION_LABELS, all: "All" };
const PAGE_SIZE = 20;

export function VerificationsView() {
  const [status, setStatus] = useState<Filter>("pending_review");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    const t = setTimeout(() => {
      setTerm(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, loading, error, reload } = useAsync(() => getVerifications({ status, search: term, page, limit: PAGE_SIZE }), [status, term, page]);
  const counts = data?.counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  const countFor = (f: Filter) => (f === "all" ? total : (counts[f] ?? 0));

  return (
    <>
      <PageHeader title="Verifications" description="Review customers' identity documents. Customers can't reserve cars until you approve them." />

      <section className={panel} aria-label="Verification submissions">
        <div className="space-y-4 border-b border-navy-900/10 p-4 sm:p-5">
          <div role="tablist" aria-label="Filter by status" className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={status === f}
                onClick={() => {
                  setStatus(f);
                  setPage(1);
                }}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                  status === f ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20 text-navy-900 hover:border-navy-900/40",
                )}
              >
                {TAB_LABELS[f]}
                <span className={cn("rounded-full px-2 text-xs font-semibold", status === f ? "bg-white/20" : "bg-navy-900/10")}>{countFor(f)}</span>
              </button>
            ))}
          </div>
          <div className="relative sm:max-w-sm">
            <label htmlFor="verification-search" className="sr-only">
              Search by customer name or email
            </label>
            <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="verification-search"
              type="search"
              value={search}
              autoComplete="off"
              placeholder="Customer name or email"
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-navy-900/20 bg-white pl-10 pr-3.5 text-sm text-ink placeholder:text-muted/80 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
            />
          </div>
        </div>

        {loading && !data ? (
          <div className="p-4 sm:p-5">
            <LoadingRows label="Loading verifications" />
          </div>
        ) : error && !data ? (
          <div className="p-4 sm:p-5">
            <ErrorState message={error} onRetry={reload} />
          </div>
        ) : !data || data.rows.length === 0 ? (
          <EmptyState
            title={term || status !== "all" ? "Nothing matches" : "No submissions yet"}
            text={status === "pending_review" && !term ? "No verifications are waiting for review." : "Try another status or search."}
          />
        ) : (
          <>
            <ul className="divide-y divide-navy-900/10" aria-busy={loading}>
              {data.rows.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/verifications/${r.id}`} className="grid gap-3 p-4 hover:bg-navy-900/[0.02] sm:p-5 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy-900">{r.customerName}</p>
                      <p className="truncate text-sm text-muted">{r.customerEmail}</p>
                    </div>
                    <dl className="contents text-sm">
                      <Meta label="Document" value={documentTypeLabel(r.documentType)} />
                      <Meta label="Submitted" value={formatIsoDate(r.submittedAt)} />
                      <Meta label="Reviewed" value={r.reviewedAt ? `${formatIsoDate(r.reviewedAt)}${r.reviewerName ? ` by ${r.reviewerName}` : ""}` : "Not yet"} />
                    </dl>
                    <StatusPill tone={verificationTone(r.status)} className="justify-self-start lg:justify-self-end">
                      {VERIFICATION_LABELS[r.status]}
                    </StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination page={data.meta?.page ?? page} pageCount={data.meta?.totalPages ?? 1} total={data.meta?.total ?? data.rows.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </section>
    </>
  );
}
