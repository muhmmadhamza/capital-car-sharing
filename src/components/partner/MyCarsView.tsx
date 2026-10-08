"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyBlock, ErrorBlock, PageHeader, Skeleton, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormControls";
import { CalendarIcon, EditIcon, EyeIcon, PinIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import { CAR_STATUS_LABELS, DAY_STATUS_LABELS } from "@/features/partners/catalog";
import { usePartnerCars } from "@/hooks/usePartnerData";
import { BODY_TYPE_LABELS } from "@/types/car";
import type { PartnerCarStatus, PartnerCarView } from "@/types/partner";
import { cn, formatPrice } from "@/lib/utils";
import { DeleteCarDialog } from "./DeleteCarDialog";
import { CarStatusBadge, PartnerCarImage, carName } from "./parts";

const action =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

function PartnerCarCard({ car, highlight, onDelete }: { car: PartnerCarView; highlight?: boolean; onDelete: (car: PartnerCarView) => void }) {
  const todayTone =
    car.today === "available" ? "text-[#14543A]" : car.today === "booked" ? "text-navy-900" : "text-[#8E1D17]";
  return (
    <article className={cn(panel, "flex flex-col overflow-hidden", highlight && "ring-2 ring-gold-500")}>
      <div className="relative aspect-[16/9] w-full">
        <PartnerCarImage car={car} />
        <CarStatusBadge status={car.status} className="absolute left-3 top-3 bg-white" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-navy-900">{carName(car)}</h2>
            <p className="text-sm text-muted">
              {car.year} · {BODY_TYPE_LABELS[car.type]}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-display text-xl font-semibold text-navy-900">{formatPrice(car.dailyPrice)}</span>
            <span className="block text-xs text-muted">per day</span>
          </p>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <dt className="sr-only">Pickup location</dt>
            <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
            <dd className="min-w-0 break-words text-navy-700">{car.location}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-navy-900/10 pt-2">
            <dt className="text-muted">Availability</dt>
            <dd className={cn("font-semibold", todayTone)}>{DAY_STATUS_LABELS[car.today]} today</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Current status</dt>
            <dd className="font-semibold text-navy-900">{CAR_STATUS_LABELS[car.status]}</dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Link href={`/partner/cars/${car.id}`} className={cn(action, "border-navy-900/30 text-navy-900 hover:border-navy-900 hover:bg-navy-900/5")}>
            <EyeIcon width={16} height={16} /> View
          </Link>
          <Link href={`/partner/cars/${car.id}/edit`} className={cn(action, "border-navy-900/30 text-navy-900 hover:border-navy-900 hover:bg-navy-900/5")}>
            <EditIcon width={16} height={16} /> Edit
          </Link>
          <Link
            href={`/partner/availability?car=${car.id}`}
            className={cn(action, "col-span-2 border-transparent bg-navy-900 text-white hover:bg-navy-700")}
          >
            <CalendarIcon width={16} height={16} className="text-gold-400" /> Manage Availability
          </Link>
          <button
            type="button"
            onClick={() => onDelete(car)}
            className={cn(action, "col-span-2 border-[#B3261E]/30 text-[#8E1D17] hover:bg-[#FBEAE9]")}
          >
            <TrashIcon width={16} height={16} /> Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export function MyCarsView() {
  const { data, loading, error, reload } = usePartnerCars();
  const [filter, setFilter] = useState<PartnerCarStatus | "all">("all");
  const [deleting, setDeleting] = useState<PartnerCarView>();
  const [removed, setRemoved] = useState<string>();
  const params = useSearchParams();
  const addedId = params.get("added");
  const updatedId = params.get("updated");
  const savedId = addedId ?? updatedId;
  const savedCar = savedId ? data?.find((c) => c.id === savedId) : undefined;

  const shown = useMemo(() => (data ?? []).filter((c) => filter === "all" || c.status === filter), [data, filter]);

  return (
    <div>
      <PageHeader
        title="My Cars"
        description="Every vehicle you have listed, with today's availability and status."
        action={
          <Button href="/partner/cars/new">
            <PlusIcon width={16} height={16} /> Add Car
          </Button>
        }
      />

      {savedCar && !removed ? (
        <p role="status" className="mb-5 rounded-lg border border-[#1E6B45]/25 bg-[#E7F4EC] px-4 py-3 text-sm font-medium text-[#14543A]">
          {carName(savedCar)} was {addedId ? "added" : "updated"}.
          {addedId && savedCar.status === "pending" ? " It is pending review and will go live once verified." : ""}
        </p>
      ) : null}

      {removed ? (
        <p role="status" className="mb-5 rounded-lg border border-[#1E6B45]/25 bg-[#E7F4EC] px-4 py-3 text-sm font-medium text-[#14543A]">
          {removed} was deleted.
        </p>
      ) : null}

      {data && data.length > 0 ? (
        <div className="mb-5 max-w-xs">
          <SelectField label="Show" value={filter} onChange={(e) => setFilter(e.target.value as PartnerCarStatus | "all")}>
            <option value="all">All cars ({data.length})</option>
            {(Object.keys(CAR_STATUS_LABELS) as PartnerCarStatus[]).map((s) => (
              <option key={s} value={s}>
                {CAR_STATUS_LABELS[s]} ({data.filter((c) => c.status === s).length})
              </option>
            ))}
          </SelectField>
        </div>
      ) : null}

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading ? (
        <div role="status" className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          <span className="sr-only">Loading your cars…</span>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyBlock
          title="No cars yet"
          text="Add your first vehicle with photos, a daily price and a pickup location."
          action={<Button href="/partner/cars/new">Add Car</Button>}
        />
      ) : shown.length === 0 ? (
        <EmptyBlock title="No cars with that status" text="Try another filter to see the rest of your fleet." action={<Button variant="outline-navy" onClick={() => setFilter("all")}>Show all cars</Button>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((car) => (
            <PartnerCarCard key={car.id} car={car} highlight={car.id === savedId} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {deleting ? (
        <DeleteCarDialog
          car={deleting}
          onCancel={() => setDeleting(undefined)}
          onDeleted={() => {
            setRemoved(carName(deleting));
            setDeleting(undefined);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}
