"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/customer/StatusBadge";
import { EmptyBlock, ErrorBlock, LoadingBlock, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, CheckIcon, ChevronLeftIcon, EditIcon, PinIcon, TrashIcon } from "@/components/ui/Icons";
import { DAY_STATUS_LABELS } from "@/features/partners/catalog";
import { usePartnerCar, usePartnerReservations } from "@/hooks/usePartnerData";
import { formatDateTime, formatIsoDate } from "@/lib/date";
import { cn, formatPrice } from "@/lib/utils";
import { BODY_TYPE_LABELS } from "@/types/car";
import { DeleteCarDialog } from "./DeleteCarDialog";
import { CarStatusBadge, PartnerCarImage, carName } from "./parts";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={cn(panel, "p-5 sm:p-6")}>
      <h2 className="mb-4 text-base font-semibold text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

/** Read-only view of one car with quick actions: the "View" in My Cars. */
export function CarDetailsView({ id }: { id: string }) {
  const router = useRouter();
  const { data: car, loading, error, reload } = usePartnerCar(id);
  const reservations = usePartnerReservations();
  const [active, setActive] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const mine = useMemo(
    () =>
      (reservations.data ?? [])
        .filter((r) => r.carId === id && (r.status === "upcoming" || r.status === "active"))
        .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate)),
    [reservations.data, id],
  );

  const back = (
    <Link href="/partner/cars" className="mb-5 inline-flex h-10 items-center gap-1 text-sm font-semibold text-navy-900 hover:text-gold-700">
      <ChevronLeftIcon width={16} height={16} /> My Cars
    </Link>
  );

  if (error) return <div>{back}<ErrorBlock message={error} onRetry={reload} /></div>;
  if (loading) return <div>{back}<LoadingBlock label="Loading car" rows={2} /></div>;
  if (!car) {
    return (
      <div>
        {back}
        <EmptyBlock title="Car not found" text="It may have been deleted, or it belongs to another partner." action={<Button href="/partner/cars">Back to My Cars</Button>} />
      </div>
    );
  }

  const specs: [string, string | number][] = [
    ["Year", car.year],
    ["Type", BODY_TYPE_LABELS[car.type]],
    ["Seats", car.seats],
    ["Doors", car.doors],
    ["Transmission", car.transmission],
    ["Fuel", car.fuelType],
  ];
  const shown = car.images[Math.min(active, Math.max(0, car.images.length - 1))];

  return (
    <div>
      {back}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{carName(car)}</h1>
            <CarStatusBadge status={car.status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            Listed {formatIsoDate(car.createdAt)} · {DAY_STATUS_LABELS[car.today]} today
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href={`/partner/cars/${car.id}/edit`} variant="navy">
            <EditIcon width={16} height={16} /> Edit
          </Button>
          <Button href={`/partner/availability?car=${car.id}`} variant="outline-navy">
            <CalendarIcon width={16} height={16} /> Availability
          </Button>
          <button
            type="button"
            onClick={() => setDeleting(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#B3261E]/40 px-5 text-sm font-semibold text-[#8E1D17] transition-colors hover:bg-[#FBEAE9]"
          >
            <TrashIcon width={16} height={16} /> Delete
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-5">
          <section className={cn(panel, "overflow-hidden")}>
            <div className="aspect-[16/9] max-h-[28rem] w-full">
              <PartnerCarImage car={car} image={shown} variant={active} />
            </div>
            {car.images.length > 1 ? (
              <ul className="flex gap-2 overflow-x-auto p-3" aria-label="Photos">
                {car.images.map((img, i) => (
                  <li key={`${img.label}-${i}`} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Show ${img.label}`}
                      aria-current={i === active}
                      className={cn("block h-16 w-24 overflow-hidden rounded-lg border-2", i === active ? "border-gold-500" : "border-transparent opacity-80 hover:opacity-100")}
                    >
                      <PartnerCarImage car={car} image={img} variant={i} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <Section title="About this car">
            <p className="text-sm leading-relaxed text-navy-700">{car.description}</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 text-sm sm:grid-cols-3">
              {specs.map(([label, value]) => (
                <div key={label} className="py-2">
                  <dt className="text-xs font-medium text-muted">{label}</dt>
                  <dd className="font-medium text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section title="Features">
            {car.features.length ? (
              <ul className="grid gap-2.5 text-sm text-navy-900 sm:grid-cols-2">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <CheckIcon width={16} height={16} className="shrink-0 text-gold-700" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No features listed yet. Add some from Edit.</p>
            )}
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Pricing and pickup">
            <p>
              <span className="font-display text-3xl font-semibold text-navy-900">{formatPrice(car.dailyPrice)}</span>
              <span className="ml-1 text-sm text-muted">per day</span>
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm text-navy-900">
              <PinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold-700" />
              <span className="break-words">{car.location}</span>
            </p>
          </Section>

          <Section title="Reservations">
            {reservations.loading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : mine.length === 0 ? (
              <p className="text-sm text-muted">No upcoming or active reservations for this car.</p>
            ) : (
              <ul className="-my-2 divide-y divide-navy-900/10">
                {mine.map((r) => (
                  <li key={r.id}>
                    <Link href={`/partner/reservations/${r.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-gold-700">
                      <span className="min-w-0 text-sm">
                        <span className="block truncate font-medium text-navy-900">{r.customer.name}</span>
                        <span className="text-xs text-muted">{formatDateTime(r.pickupDate)}</span>
                      </span>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>

      {deleting ? <DeleteCarDialog car={car} onCancel={() => setDeleting(false)} onDeleted={() => router.push("/partner/cars")} /> : null}
    </div>
  );
}
