"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EditIcon, ListIcon } from "@/components/ui/Icons";
import { CUSTOMER_STATUS_LABELS, customerTone } from "@/features/admin/status";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { getCustomerById } from "@/services/admin/customer.service";
import type { AdminCustomerDetail, AdminCustomerRow } from "@/types/admin";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { ReservationsList } from "../ReservationsList";
import { BackLink, DangerButton, EmptyState, ErrorState, LoadingRows, Meta, PageHeader, StatusPill, panel, useScrollToHash } from "../ui";
import { useCustomerActions } from "./useCustomerActions";

export function CustomerDetailsView({ id }: { id: string }) {
  const { data, loading, error, reload } = useAsync(() => getCustomerById(id), [id]);
  const [patch, setPatch] = useState<Partial<AdminCustomerRow>>();

  useEffect(() => setPatch(undefined), [data]);
  useScrollToHash(Boolean(data));

  const customer: AdminCustomerDetail | undefined = useMemo(() => (data ? { ...data, ...patch } : undefined), [data, patch]);

  const actions = useCustomerActions({
    apply: (_id, next) => setPatch((prev) => (next ? { ...prev, ...next } : undefined)),
    applyRow: (row) => setPatch(row),
  });

  const back = <BackLink href="/admin/customers">All customers</BackLink>;

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Customer" back={back} />
        <LoadingRows label="Loading customer" rows={4} />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <PageHeader title="Customer" back={back} />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }
  if (!customer) {
    return (
      <>
        <PageHeader title="Customer not found" back={back} />
        <div className={panel}>
          <EmptyState title="We could not find that customer" text="The link may be out of date, or the account no longer exists." action={<Button href="/admin/customers" variant="navy">Back to customers</Button>} />
        </div>
      </>
    );
  }

  const active = customer.status === "active";

  return (
    <>
      <PageHeader
        back={back}
        title={customer.name}
        description={`Customer account ${customer.id}`}
        action={
          <>
            <Button variant="outline-navy" onClick={() => actions.edit(customer)}>
              <EditIcon width={18} height={18} /> Edit
            </Button>
            {active ? (
              <DangerButton onClick={() => actions.requestDeactivate(customer)}>
                <PauseCircleIcon width={18} height={18} /> Deactivate
              </DangerButton>
            ) : (
              <Button variant="navy" onClick={() => actions.activate(customer)}>
                <CheckCircleIcon width={18} height={18} /> Activate
              </Button>
            )}
            <Button href="#reservations" variant="gold">
              <ListIcon width={18} height={18} /> View reservations
            </Button>
          </>
        }
      />

      <section aria-labelledby="customer-info" className={`${panel} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={customer.name} className="h-16 w-16 text-xl" />
          <div className="min-w-0">
            <h2 id="customer-info" className="truncate text-xl font-semibold text-navy-900">
              {customer.name}
            </h2>
            <div className="mt-1.5">
              <StatusPill tone={customerTone(customer.status)}>{CUSTOMER_STATUS_LABELS[customer.status]}</StatusPill>
            </div>
          </div>
        </div>
        <dl className="mt-6 grid gap-x-6 gap-y-5 border-t border-navy-900/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Meta label="Name" value={customer.name} />
          <Meta label="Email" value={customer.email} />
          <Meta label="Phone" value={customer.phone} />
          <Meta label="Registration date" value={formatIsoDate(customer.createdAt)} />
          <Meta label="Account status" value={CUSTOMER_STATUS_LABELS[customer.status]} />
          <Meta label="Reservations" value={customer.reservationCount} />
        </dl>
      </section>

      <section id="reservations" aria-labelledby="reservations-heading" className={`${panel} mt-6 scroll-mt-24`}>
        <div className="flex items-center justify-between gap-3 border-b border-navy-900/10 px-4 py-4 sm:px-5">
          <h2 id="reservations-heading" className="text-lg font-semibold text-navy-900">
            Reservations
          </h2>
          <span className="text-sm text-muted">{customer.reservations.length} total</span>
        </div>
        <ReservationsList reservations={customer.reservations} show="partner" />
      </section>

      {actions.dialogs}
    </>
  );
}
