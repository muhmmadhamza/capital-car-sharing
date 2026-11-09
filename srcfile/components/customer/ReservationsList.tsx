"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS, STATUS_ORDER, summarize } from "@/features/reservations/status";
import { useReservations } from "@/hooks/useReservations";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/reservation";
import { ReservationCard } from "./ReservationCard";
import { EmptyBlock, ErrorBlock, LoadingBlock, PageHeader } from "./States";

type Filter = "all" | ReservationStatus;

export function ReservationsList() {
  const { data, loading, error, reload } = useReservations();
  const [filter, setFilter] = useState<Filter>("all");
  const summary = useMemo(() => (data ? summarize(data) : undefined), [data]);

  const visible = useMemo(() => {
    const list = (data ?? []).filter((r) => filter === "all" || r.status === filter);
    // Trips still to come read best soonest-first; history reads best newest-first.
    const rank = { active: 0, upcoming: 1, completed: 2, cancelled: 3 } as const;
    return [...list].sort((a, b) => {
      if (a.status === "upcoming" && b.status === "upcoming") return a.pickupDate.localeCompare(b.pickupDate);
      return rank[a.status] - rank[b.status] || b.pickupDate.localeCompare(a.pickupDate);
    });
  }, [data, filter]);

  const tabs: { id: Filter; label: string; count: number | undefined }[] = [
    { id: "all", label: "All", count: summary?.total },
    ...STATUS_ORDER.map((s) => ({ id: s, label: STATUS_LABELS[s], count: summary?.[s] })),
  ];

  return (
    <div>
      <PageHeader title="My Reservations" description="Every trip you have booked, with its dates, price and status." />

      <div role="tablist" aria-label="Filter reservations" className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={filter === t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              filter === t.id
                ? "border-navy-900 bg-navy-900 text-white"
                : "border-navy-900/20 bg-white text-navy-900 hover:border-navy-900/50",
            )}
          >
            {t.label}
            {t.count !== undefined ? (
              <span className={cn("rounded-full px-1.5 text-xs", filter === t.id ? "bg-white/15 text-gold-400" : "bg-navy-900/[0.07] text-navy-700")}>{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-live="polite">
        {error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : loading ? (
          <LoadingBlock label="Loading your reservations" />
        ) : visible.length === 0 ? (
          <EmptyBlock
            title={filter === "all" ? "No reservations yet" : `No ${STATUS_LABELS[filter as ReservationStatus].toLowerCase()} reservations`}
            text={filter === "all" ? "Once you reserve a car, your trips will show up here." : "Nothing matches this filter right now."}
            action={filter === "all" ? <Button href="/cars">Find a car</Button> : <Button variant="outline-navy" onClick={() => setFilter("all")}>Show all</Button>}
          />
        ) : (
          <div className="space-y-4">
            {visible.map((r) => (
              <ReservationCard key={r.id} reservation={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
