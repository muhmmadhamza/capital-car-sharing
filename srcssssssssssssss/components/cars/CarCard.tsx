import type { Car } from "@/types/car";
import type { AvailabilityResult } from "@/types/booking";
import { formatPrice } from "@/lib/utils";
import { BagIcon, FuelIcon, GearIcon, PinIcon, SeatIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { CarImageView } from "./CarImageView";

type Props = {
  car: Car & { location?: { name: string } };
  /** Omit on pages that have no availability context (e.g. the landing page). */
  availability?: AvailabilityResult;
  hasWindow?: boolean;
  /** Query string with the rental window, so the details page opens with the same dates. */
  detailsQuery?: string;
};

export function CarCard({ car, availability, hasWindow = false, detailsQuery }: Props) {
  const href = `/cars/${car.slug}${detailsQuery ? `?${detailsQuery}` : ""}`;
  const booked = availability?.status === "booked";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
        <CarImageView car={car} image={car.images[0]} className={booked ? "opacity-70" : undefined} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        {availability ? <AvailabilityBadge availability={availability} hasWindow={hasWindow} className="self-start" /> : null}

        <p className={`text-sm text-muted ${availability ? "mt-3" : ""}`}>
          {car.category}, {car.year}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-navy-900">
          {car.make} {car.model}
        </h3>
        {car.location ? (
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
            <PinIcon width={15} height={15} className="text-gold-700" />
            {car.location.name}
          </p>
        ) : null}

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-700">
          <li className="inline-flex items-center gap-1.5">
            <SeatIcon width={17} height={17} className="text-gold-700" />
            {car.seats} seats
          </li>
          <li className="inline-flex items-center gap-1.5">
            <GearIcon width={17} height={17} className="text-gold-700" />
            {car.transmission}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <FuelIcon width={17} height={17} className="text-gold-700" />
            {car.fuel}
          </li>
          {availability ? (
            <li className="inline-flex items-center gap-1.5">
              <BagIcon width={17} height={17} className="text-gold-700" />
              {car.luggage} bags
            </li>
          ) : null}
        </ul>

        <div className="mt-6 flex flex-col gap-4 border-t border-navy-900/10 pt-4">
          <p className="whitespace-nowrap">
            <span className="font-display text-2xl font-semibold text-navy-900">{formatPrice(car.pricePerDay)}</span>
            <span className="ml-1 text-sm text-muted">per day</span>
          </p>
          <Button
            href={href}
            variant={booked ? "outline-navy" : "navy"}
            className="w-full"
            aria-label={`View details for ${car.make} ${car.model}`}
          >
            View Details
          </Button>
        </div>
      </div>
    </article>
  );
}
