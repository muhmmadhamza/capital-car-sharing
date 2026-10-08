"use client";

import Link from "next/link";
import { CarImageView } from "@/components/cars/CarImageView";
import { Button } from "@/components/ui/Button";
import { CarIcon, UserIcon } from "@/components/ui/Icons";
import { RESERVATION_LABELS, reservationTone } from "@/features/admin/status";
import { carLabel, formatIsoDateTime } from "@/features/admin/format";
import { useAsync } from "@/hooks/useAsync";
import { formatDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { getReservationById } from "@/services/admin/reservation.service";
import { BODY_TYPE_LABELS } from "@/types/car";
import { BuildingIcon } from "../AdminIcons";
import { AdminCard } from "../controls";
import { BackLink, EmptyState, ErrorState, LoadingRows, Meta, PageHeader, StatusPill, panel } from "../ui";

export function ReservationDetailsView({ id }: { id: string }) {
  const { data: r, loading, error, reload } = useAsync(() => getReservationById(id), [id]);
  const back = <BackLink href="/admin/reservations">All reservations</BackLink>;

  if (loading && !r) {
    return (
      <>
        <PageHeader title="Reservation" back={back} />
        <LoadingRows label="Loading reservation" rows={4} />
      </>
    );
  }
  if (error && !r) {
    return (
      <>
        <PageHeader title="Reservation" back={back} />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }
  if (!r) {
    return (
      <>
        <PageHeader title="Reservation not found" back={back} />
        <div className={panel}>
          <EmptyState title="We could not find that reservation" text="The link may be out of date, or the reservation no longer exists." action={<Button href="/admin/reservations" variant="navy">Back to reservations</Button>} />
        </div>
      </>
    );
  }

  const dayLabel = `${r.days} day${r.days === 1 ? "" : "s"}`;

  return (
    <>
      <PageHeader
        back={back}
        title={`Reservation ${r.id}`}
        description={`${r.carName} for ${r.customerName}`}
        action={
          <>
            <Button href={`/admin/customers/${r.customerId}`} variant="outline-navy">
              <UserIcon width={18} height={18} /> Customer
            </Button>
            <Button href={`/admin/partners/${r.partnerId}`} variant="outline-navy">
              <BuildingIcon width={18} height={18} /> Partner
            </Button>
            <Button href={`/admin/cars/${r.carId}`} variant="gold">
              <CarIcon width={18} height={18} /> Car
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
        <AdminCard title="Customer" action={<Link href={`/admin/customers/${r.customer.id}`} className="text-sm font-semibold text-navy-900 hover:text-gold-700">View customer</Link>}>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Meta label="Name" value={r.customer.name} />
            <Meta label="Phone" value={r.customer.phone} />
            <div className="sm:col-span-2">
              <Meta label="Email" value={r.customer.email} />
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Partner" action={<Link href={`/admin/partners/${r.partner.id}`} className="text-sm font-semibold text-navy-900 hover:text-gold-700">View partner</Link>}>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Meta label="Name" value={r.partner.name} />
            <Meta label="Company" value={r.partner.companyName} />
            <Meta label="Email / contact" value={r.partner.email} />
            <Meta label="Phone" value={r.partner.phone} />
          </dl>
        </AdminCard>

        <AdminCard title="Vehicle" action={<Link href={`/admin/cars/${r.car.id}`} className="text-sm font-semibold text-navy-900 hover:text-gold-700">View car</Link>}>
          <div className="mb-5 aspect-[16/8] w-full overflow-hidden rounded-xl bg-navy-900">
            <CarImageView car={r.car} image={r.car.imageSrc ? { src: r.car.imageSrc, alt: `${r.car.make} ${r.car.model}`, label: carLabel(r.car) } : undefined} />
          </div>
          <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Meta label="Make" value={r.car.make} />
            <Meta label="Model" value={r.car.model} />
            <Meta label="Year" value={r.car.year} />
            <Meta label="Car type" value={BODY_TYPE_LABELS[r.car.bodyType]} />
          </dl>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard title="Rental">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Meta label="Pickup location" value={r.pickupLocation} />
              <Meta label="Rental duration" value={dayLabel} />
              <Meta label="Pickup date / time" value={formatDateTime(r.pickupDate)} />
              <Meta label="Return date / time" value={formatDateTime(r.returnDate)} />
            </dl>
          </AdminCard>

          <AdminCard title="Pricing" description="Rate agreed at booking. Later price changes never alter it.">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
              <Meta label="Daily rate" value={formatPrice(r.dailyPrice)} />
              <Meta label="Billable days" value={r.days} />
              <Meta label="Total amount" value={<span className="font-display text-xl font-semibold">{formatPrice(r.totalPrice)}</span>} />
            </dl>
          </AdminCard>

          <AdminCard title="Reservation">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Meta label="Reservation ID" value={<span className="font-mono text-sm">{r.id}</span>} />
              <Meta label="Status" value={<StatusPill tone={reservationTone(r.status)}>{RESERVATION_LABELS[r.status]}</StatusPill>} />
              <Meta label="Booked on" value={formatIsoDateTime(r.createdAt)} />
            </dl>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
