import Link from "next/link";
import { RESERVATION_LABELS, reservationTone } from "@/features/admin/status";
import { formatDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import type { AdminReservationView } from "@/types/admin";
import { EmptyState, Meta, StatusPill } from "./ui";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-700";
const td = "px-4 py-3.5 align-middle text-sm text-navy-900";

/**
 * Read-only reservation list for the customer, partner and car pages. Each id opens
 * /admin/reservations/:id. Search and filters live on /admin/reservations.
 * `show` picks which "other side" column to draw: the customer, the partner, or neither.
 */
export function ReservationsList({ reservations, show }: { reservations: AdminReservationView[]; show: "customer" | "partner" }) {
  if (reservations.length === 0) {
    return <EmptyState title="No reservations yet" text="Reservations will appear here as soon as one is made." />;
  }
  const whoLabel = show === "customer" ? "Customer" : "Partner";
  const who = (r: AdminReservationView) => (show === "customer" ? r.customerName : r.partnerName);
  const whoHref = (r: AdminReservationView) => (show === "customer" ? `/admin/customers/${r.customerId}` : `/admin/partners/${r.partnerId}`);

  return (
    <>
      <div className="hidden xl:block">
        <table className="w-full table-fixed">
          <caption className="sr-only">Reservations</caption>
          <thead className="bg-navy-900/[0.03]">
            <tr>
              <th scope="col" className={`${th} w-[10%]`}>Reservation</th>
              <th scope="col" className={`${th} w-[16%]`}>Car</th>
              <th scope="col" className={`${th} w-[15%]`}>{whoLabel}</th>
              <th scope="col" className={`${th} w-[13%]`}>Pickup location</th>
              <th scope="col" className={`${th} w-[12%]`}>Pickup</th>
              <th scope="col" className={`${th} w-[12%]`}>Return</th>
              <th scope="col" className={`${th} w-[8%]`}>Total</th>
              <th scope="col" className={`${th} w-[14%]`}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-900/10">
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className={`${td} font-mono text-xs`}>
                  <Link href={`/admin/reservations/${r.id}`} className="font-semibold hover:text-gold-700">{r.id}</Link>
                </td>
                <td className={td}><span className="block truncate" title={r.carName}>{r.carName}</span></td>
                <td className={td}>
                  <Link href={whoHref(r)} className="block truncate font-medium hover:text-gold-700" title={who(r)}>
                    {who(r)}
                  </Link>
                </td>
                <td className={td}><span className="block truncate" title={r.pickupLocation}>{r.pickupLocation}</span></td>
                <td className={td}>{formatDateTime(r.pickupDate)}</td>
                <td className={td}>{formatDateTime(r.returnDate)}</td>
                <td className={`${td} font-semibold`}>{formatPrice(r.totalPrice)}</td>
                <td className={td}>
                  <StatusPill tone={reservationTone(r.status)}>{RESERVATION_LABELS[r.status]}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-navy-900/10 xl:hidden">
        {reservations.map((r) => (
          <li key={r.id} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy-900">{r.carName}</p>
                <Link href={`/admin/reservations/${r.id}`} className="font-mono text-xs text-muted hover:text-gold-700">{r.id}</Link>
              </div>
              <StatusPill tone={reservationTone(r.status)}>{RESERVATION_LABELS[r.status]}</StatusPill>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <Meta label={whoLabel} value={<Link href={whoHref(r)} className="hover:text-gold-700">{who(r)}</Link>} />
              <Meta label="Pickup location" value={r.pickupLocation} />
              <Meta label="Total" value={formatPrice(r.totalPrice)} />
              <Meta label="Pickup" value={formatDateTime(r.pickupDate)} />
              <Meta label="Return" value={formatDateTime(r.returnDate)} />
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
