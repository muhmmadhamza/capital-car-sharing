"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CarIcon, ListIcon } from "@/components/ui/Icons";
import { APPROVAL_LABELS, CAR_STATUS_LABELS, PARTNER_STATUS_LABELS, approvalTone, carTone, partnerTone } from "@/features/admin/status";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { getPartnerById } from "@/services/admin/partner.service";
import type { AdminCarView, AdminPartnerDetail, AdminPartnerRow } from "@/types/admin";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { ReservationsList } from "../ReservationsList";
import { BackLink, DangerButton, EmptyState, ErrorState, LoadingRows, Meta, PageHeader, StatusPill, panel, useScrollToHash } from "../ui";
import { usePartnerActions } from "./usePartnerActions";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

/** Read-only car list. Approvals and editing live on /admin/cars. */
function CarsList({ cars }: { cars: AdminCarView[] }) {
  if (cars.length === 0) return <EmptyState title="No cars listed" text="This partner has not added any cars yet." />;
  return (
    <>
      <div className="hidden md:block">
        <table className="w-full table-fixed">
          <caption className="sr-only">Cars</caption>
          <thead className="bg-navy-900/[0.03]">
            <tr>
              <th scope="col" className={`${th} w-[30%]`}>Car</th>
              <th scope="col" className={`${th} w-[14%]`}>Daily price</th>
              <th scope="col" className={`${th} w-[18%]`}>Availability</th>
              <th scope="col" className={`${th} w-[22%]`}>Approval</th>
              <th scope="col" className={`${th} w-[16%]`}>Reservations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/10">
            {cars.map((c) => (
              <tr key={c.id}>
                <td className={td}>
                  <Link href={`/admin/cars/${c.id}`} className="block truncate font-semibold hover:text-gold-700">{c.make} {c.model}</Link>
                  <span className="block text-xs text-muted">{c.year}</span>
                </td>
                <td className={`${td} font-semibold`}>{formatPrice(c.dailyPrice)}</td>
                <td className={td}><StatusPill tone={carTone(c.status)}>{CAR_STATUS_LABELS[c.status]}</StatusPill></td>
                <td className={td}><StatusPill tone={approvalTone(c.approvalStatus)}>{APPROVAL_LABELS[c.approvalStatus]}</StatusPill></td>
                <td className={td}>{c.reservationCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-navy-900/10 md:hidden">
        {cars.map((c) => (
          <li key={c.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/cars/${c.id}`} className="block truncate font-semibold text-navy-900 hover:text-gold-700">{c.make} {c.model}</Link>
                <p className="text-xs text-muted">{c.year} · {formatPrice(c.dailyPrice)} / day</p>
              </div>
              <StatusPill tone={carTone(c.status)}>{CAR_STATUS_LABELS[c.status]}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill tone={approvalTone(c.approvalStatus)}>{APPROVAL_LABELS[c.approvalStatus]}</StatusPill>
              <span className="text-xs text-muted">{c.reservationCount} reservation{c.reservationCount === 1 ? "" : "s"}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export function PartnerDetailsView({ id }: { id: string }) {
  const { data, loading, error, reload } = useAsync(() => getPartnerById(id), [id]);
  const [patch, setPatch] = useState<Partial<AdminPartnerRow>>();

  useEffect(() => setPatch(undefined), [data]);
  useScrollToHash(Boolean(data));

  const partner: AdminPartnerDetail | undefined = useMemo(() => (data ? { ...data, ...patch } : undefined), [data, patch]);
  const actions = usePartnerActions({ apply: (_id, next) => setPatch((prev) => (next ? { ...prev, ...next } : undefined)) });

  const back = <BackLink href="/admin/partners">All partners</BackLink>;

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Partner" back={back} />
        <LoadingRows label="Loading partner" rows={4} />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <PageHeader title="Partner" back={back} />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }
  if (!partner) {
    return (
      <>
        <PageHeader title="Partner not found" back={back} />
        <div className={panel}>
          <EmptyState title="We could not find that partner" text="The link may be out of date, or the account no longer exists." action={<Button href="/admin/partners" variant="navy">Back to partners</Button>} />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        back={back}
        title={partner.companyName}
        description={`Partner account ${partner.id}`}
        action={
          <>
            {partner.status === "pending" ? (
              <Button variant="navy" onClick={() => actions.approve(partner)}>
                <CheckCircleIcon width={18} height={18} /> Approve
              </Button>
            ) : null}
            {partner.status === "suspended" ? (
              <Button variant="navy" onClick={() => actions.activate(partner)}>
                <CheckCircleIcon width={18} height={18} /> Activate
              </Button>
            ) : (
              <DangerButton onClick={() => actions.requestSuspend(partner)}>
                <PauseCircleIcon width={18} height={18} /> Suspend
              </DangerButton>
            )}
            <Button href="#cars" variant="outline-navy">
              <CarIcon width={18} height={18} /> View cars
            </Button>
            <Button href="#reservations" variant="gold">
              <ListIcon width={18} height={18} /> View reservations
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section aria-labelledby="partner-info" className={`${panel} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar name={partner.name} className="h-16 w-16 text-xl" />
            <div className="min-w-0">
              <h2 id="partner-info" className="truncate text-xl font-semibold text-navy-900">
                {partner.companyName}
              </h2>
              <p className="truncate text-sm text-muted">Contact: {partner.name}</p>
              <div className="mt-1.5">
                <StatusPill tone={partnerTone(partner.status)}>{PARTNER_STATUS_LABELS[partner.status]}</StatusPill>
              </div>
            </div>
          </div>
          <dl className="mt-6 grid gap-x-6 gap-y-5 border-t border-navy-900/10 pt-6 sm:grid-cols-2">
            <Meta label="Name" value={partner.name} />
            <Meta label="Company" value={partner.companyName} />
            <Meta label="Email" value={partner.email} />
            <Meta label="Phone" value={partner.phone} />
            <Meta label="Registration date" value={formatIsoDate(partner.createdAt)} />
            <Meta label="Status" value={PARTNER_STATUS_LABELS[partner.status]} />
          </dl>
        </section>

        <section aria-label="Partner statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <div className={`${panel} p-5`}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
              <CarIcon width={20} height={20} />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-navy-900">{partner.carCount}</p>
            <p className="text-sm font-medium text-navy-700">Number of cars</p>
          </div>
          <div className={`${panel} p-5`}>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
              <ListIcon width={20} height={20} />
            </span>
            <p className="mt-4 font-display text-3xl font-semibold text-navy-900">{partner.reservationCount}</p>
            <p className="text-sm font-medium text-navy-700">Number of reservations</p>
          </div>
        </section>
      </div>

      <section id="cars" aria-labelledby="cars-heading" className={`${panel} mt-6 scroll-mt-24`}>
        <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-4 sm:px-5">
          <h2 id="cars-heading" className="text-lg font-semibold text-navy-900">
            Cars
          </h2>
          <span className="text-sm text-muted">{partner.cars.length} total</span>
        </div>
        <CarsList cars={partner.cars} />
      </section>

      <section id="reservations" aria-labelledby="reservations-heading" className={`${panel} mt-6 scroll-mt-24`}>
        <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-4 sm:px-5">
          <h2 id="reservations-heading" className="text-lg font-semibold text-navy-900">
            Reservations
          </h2>
          <span className="text-sm text-muted">{partner.reservations.length} total</span>
        </div>
        <ReservationsList reservations={partner.reservations} show="customer" />
      </section>

      {actions.dialogs}
    </>
  );
}
