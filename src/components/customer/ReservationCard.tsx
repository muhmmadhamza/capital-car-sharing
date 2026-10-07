import Link from "next/link";
import { CarImageView } from "@/components/cars/CarImageView";
import { CalendarIcon, ChevronRightIcon, PinIcon } from "@/components/ui/Icons";
import { formatDateTime } from "@/lib/date";
import { cn, formatPrice } from "@/lib/utils";
import type { ReservationView } from "@/types/reservation";
import { StatusBadge } from "./StatusBadge";
import { panel } from "./States";

export function ReservationCard({ reservation: r }: { reservation: ReservationView }) {
  const name = `${r.car.make} ${r.car.model}`;
  return (
    <article className={cn(panel, "overflow-hidden transition-shadow hover:shadow-lg")}>
      <div className="grid sm:grid-cols-[13rem_1fr] md:grid-cols-[15rem_1fr]">
        <div className="aspect-[16/9] sm:aspect-auto sm:min-h-[11rem]">
          <CarImageView car={r.car} image={r.car.images[0]} className={r.status === "cancelled" ? "opacity-60" : undefined} />
        </div>

        <div className="flex flex-col p-5">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-semibold leading-snug text-navy-900">{name}</h3>
              <p className="text-sm text-muted">
                {r.car.year} · {r.car.category}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>

          <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="sr-only">Pickup location</dt>
              <dd className="flex items-center gap-2 text-navy-900">
                <PinIcon width={16} height={16} className="shrink-0 text-gold-700" />
                {r.location.name}, {r.location.city}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Pickup</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-medium text-navy-900">
                <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                {formatDateTime(r.pickupDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Return</dt>
              <dd className="mt-0.5 flex items-center gap-2 font-medium text-navy-900">
                <CalendarIcon width={16} height={16} className="shrink-0 text-gold-700" />
                {formatDateTime(r.returnDate)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-navy-900/10 pt-4">
            <p className="text-sm text-navy-700">
              {r.days} {r.days === 1 ? "day" : "days"} × {formatPrice(r.dailyPrice)}
              <span className="mx-2 text-navy-900/30" aria-hidden="true">
                |
              </span>
              <span className="font-display text-base font-semibold text-navy-900">{formatPrice(r.totalPrice)}</span>
            </p>
            <Link
              href={`/customer/reservations/${r.id}`}
              aria-label={`View details for ${name}`}
              className="inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-navy-900 hover:bg-navy-900/5"
            >
              View details <ChevronRightIcon width={16} height={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
