"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CarImageView } from "@/components/cars/CarImageView";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EditIcon, TrashIcon, XCircleIcon } from "@/components/ui/Icons";
import { PARTNER_STATUS_LABELS, CAR_LIST_STATUS_LABELS, CAR_STATUS_LABELS, carAvailability, carListStatus, carListTone, carTone, partnerTone } from "@/features/admin/status";
import { carLabel, formatIsoDateTime } from "@/features/admin/format";
import { useAsync } from "@/hooks/useAsync";
import { formatPrice } from "@/lib/utils";
import { getCarById } from "@/services/admin/car.service";
import type { AdminCarDetail, AdminCarView, CarApprovalStatus } from "@/types/admin";
import { BODY_TYPE_LABELS } from "@/types/car";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { AdminCard } from "../controls";
import { ReservationsList } from "../ReservationsList";
import { BackLink, DangerButton, EmptyState, ErrorState, LoadingRows, Meta, PageHeader, StatusPill, panel } from "../ui";
import { useCarActions } from "./useCarActions";

/** Where the car is in the approval workflow: listed, under review, live. */
function WorkflowSteps({ approval }: { approval: CarApprovalStatus }) {
  const steps = [
    { label: "Partner adds car", state: "done" as const },
    {
      label: approval === "rejected" ? "Rejected" : "Pending approval",
      state: approval === "pending" ? ("current" as const) : approval === "rejected" ? ("blocked" as const) : ("done" as const),
    },
    {
      label: approval === "suspended" ? "Suspended" : "Active",
      state: approval === "approved" ? ("done" as const) : approval === "suspended" ? ("blocked" as const) : ("todo" as const),
    },
  ];
  const dot = { done: "bg-[#1E6B45] text-white", current: "bg-gold-500 text-navy-950", blocked: "bg-[#B3261E] text-white", todo: "bg-navy-900/10 text-navy-700" };
  return (
    <ol className="grid gap-3 sm:grid-cols-3" aria-label="Approval workflow">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3 rounded-xl border border-navy-900/10 px-4 py-3" aria-current={s.state === "current" ? "step" : undefined}>
          <span aria-hidden="true" className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${dot[s.state]}`}>
            {s.state === "blocked" ? "!" : i + 1}
          </span>
          <span className="text-sm font-medium text-navy-900">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function CarDetailsView({ id }: { id: string }) {
  const router = useRouter();
  const { data, loading, error, reload } = useAsync(() => getCarById(id), [id]);
  const [patch, setPatch] = useState<Partial<AdminCarView>>();

  useEffect(() => setPatch(undefined), [data]);

  const car: AdminCarDetail | undefined = useMemo(() => (data ? { ...data, ...patch } : undefined), [data, patch]);
  const actions = useCarActions({
    apply: (_id, next) => setPatch((prev) => (next ? { ...prev, ...next } : undefined)),
    onDeleted: () => router.replace("/admin/cars"),
  });

  const back = <BackLink href="/admin/cars">All cars</BackLink>;

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Car" back={back} />
        <LoadingRows label="Loading car" rows={4} />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <PageHeader title="Car" back={back} />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }
  if (!car) {
    return (
      <>
        <PageHeader title="Car not found" back={back} />
        <div className={panel}>
          <EmptyState title="We could not find that car" text="The link may be out of date, or the car has been deleted." action={<Button href="/admin/cars" variant="navy">Back to cars</Button>} />
        </div>
      </>
    );
  }

  const status = carListStatus(car);
  const availability = carAvailability(car);
  const approval = car.approvalStatus;
  const partnerNotActive = car.partner.status !== "active";

  return (
    <>
      <PageHeader
        back={back}
        title={`${car.make} ${car.model}`}
        description={`${car.year} · Car ${car.id}`}
        action={
          <>
            <Button variant="outline-navy" onClick={() => actions.requestEdit(car)}>
              <EditIcon width={18} height={18} /> Edit
            </Button>
            {approval === "pending" || approval === "rejected" ? (
              <Button variant="navy" onClick={() => actions.approve(car)}>
                <CheckCircleIcon width={18} height={18} /> Approve
              </Button>
            ) : null}
            {approval === "suspended" ? (
              <Button variant="navy" onClick={() => actions.activate(car)}>
                <CheckCircleIcon width={18} height={18} /> Activate
              </Button>
            ) : null}
            {approval === "pending" ? (
              <DangerButton onClick={() => actions.requestReject(car)}>
                <XCircleIcon width={18} height={18} /> Reject
              </DangerButton>
            ) : null}
            {approval === "approved" ? (
              <DangerButton onClick={() => actions.requestSuspend(car)}>
                <PauseCircleIcon width={18} height={18} /> Suspend
              </DangerButton>
            ) : null}
            <DangerButton onClick={() => actions.requestDelete(car)}>
              <TrashIcon width={18} height={18} /> Delete
            </DangerButton>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <section aria-label="Car image" className={`${panel} overflow-hidden`}>
            <div className="aspect-[16/8] w-full bg-navy-900">
              <CarImageView
                car={car}
                image={car.imageSrc ? { src: car.imageSrc, alt: `${car.make} ${car.model}`, label: carLabel(car) } : undefined}
              />
            </div>
          </section>

          <AdminCard title="Vehicle">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Meta label="Make" value={car.make} />
              <Meta label="Model" value={car.model} />
              <Meta label="Year" value={car.year} />
              <Meta label="Car type" value={BODY_TYPE_LABELS[car.bodyType]} />
              <Meta label="Location" value={car.locationName} />
              <Meta label="Daily price" value={formatPrice(car.dailyPrice)} />
              <Meta label="Listed on" value={formatIsoDateTime(car.createdAt)} />
              <Meta label="Reservations" value={car.reservationCount} />
            </dl>
          </AdminCard>
        </div>

        <div className="space-y-6">
          <AdminCard title="Status">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Meta label="Car status" value={<StatusPill tone={carListTone(status)}>{CAR_LIST_STATUS_LABELS[status]}</StatusPill>} />
              <Meta label="Availability" value={<StatusPill tone={carTone(availability)}>{CAR_STATUS_LABELS[availability]}</StatusPill>} />
            </dl>
            {approval === "pending" ? (
              <p className="mt-5 rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">This car is waiting for an admin decision. Approve it to make it Active, or reject it.</p>
            ) : null}
            {approval === "rejected" ? <p className="mt-5 rounded-lg bg-navy-900/[0.04] px-4 py-3 text-sm text-navy-700">This listing was rejected and is hidden from renters. You can still approve it after a re-review.</p> : null}
            {approval === "suspended" ? <p className="mt-5 rounded-lg bg-navy-900/[0.04] px-4 py-3 text-sm text-navy-700">This car is suspended and hidden from renters. Activate it to bring it back.</p> : null}
          </AdminCard>

          <AdminCard title="Partner" action={<Link href={`/admin/partners/${car.partner.id}`} className="text-sm font-semibold text-navy-900 hover:text-gold-700">View partner</Link>}>
            <div className="flex items-center gap-3">
              <Avatar name={car.partner.name} className="h-11 w-11" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-900">{car.partner.companyName}</p>
                <p className="truncate text-sm text-muted">Contact: {car.partner.name}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-x-6 gap-y-5 border-t border-navy-900/10 pt-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Meta label="Partner name" value={car.partner.name} />
              <Meta label="Company name" value={car.partner.companyName} />
              <Meta label="Partner status" value={<StatusPill tone={partnerTone(car.partner.status)}>{PARTNER_STATUS_LABELS[car.partner.status]}</StatusPill>} />
            </dl>
            {partnerNotActive ? (
              <p className="mt-5 rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
                This partner is {PARTNER_STATUS_LABELS[car.partner.status].toLowerCase()}. Check the account before approving its cars.
              </p>
            ) : null}
          </AdminCard>
        </div>
      </div>

      <AdminCard title="Approval workflow" description="Every listing goes through review before renters can see it." className="mt-6">
        <WorkflowSteps approval={approval} />
      </AdminCard>

      <section id="reservations" aria-labelledby="car-reservations-heading" className={`${panel} mt-6 scroll-mt-24`}>
        <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-4 sm:px-5">
          <h2 id="car-reservations-heading" className="text-lg font-semibold text-navy-900">
            Reservations
          </h2>
          <span className="text-sm text-muted">{car.reservations.length} total</span>
        </div>
        <ReservationsList reservations={car.reservations} show="customer" />
      </section>

      {actions.dialogs}
    </>
  );
}
