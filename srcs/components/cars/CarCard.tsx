import type { Car } from "@/types/car";
import { formatPrice } from "@/lib/utils";
import { FuelIcon, GearIcon, SeatIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { CarIllustration } from "./CarIllustration";

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-card">
      <div className="bg-navy-900 px-5 pb-3 pt-6">
        <CarIllustration type={car.bodyType} paint={car.paint} className="mx-auto h-auto w-full max-w-[22rem]" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-muted">
          {car.category}, {car.year}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-navy-900">
          {car.make} {car.model}
        </h3>

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
        </ul>

        <div className="mt-6 flex flex-col gap-4 border-t border-navy-900/10 pt-4">
          <p className="whitespace-nowrap">
            <span className="font-display text-2xl font-semibold text-navy-900">{formatPrice(car.pricePerDay)}</span>
            <span className="ml-1 text-sm text-muted">per day</span>
          </p>
          {/* Becomes a link to /cars/[slug] when the car detail page exists. */}
          <Button variant="outline-navy" className="w-full" aria-label={`View details for ${car.make} ${car.model}`}>
            View details
          </Button>
        </div>
      </div>
    </article>
  );
}
