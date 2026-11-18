import { CarIllustration } from "@/components/cars/CarIllustration";
import { cn } from "@/lib/utils";
import type { AdminCar } from "@/types/admin";

/** Small car picture for table rows. A real photo when `imageSrc` is set, the placeholder illustration otherwise. */
export function CarThumb({ car, className }: { car: Pick<AdminCar, "make" | "model" | "bodyType" | "paint" | "imageSrc">; className?: string }) {
  return (
    <span className={cn("flex h-12 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy-900", className)}>
      {car.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={car.imageSrc} alt={`${car.make} ${car.model}`} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <CarIllustration type={car.bodyType} paint={car.paint} className="h-auto w-full px-1" />
      )}
    </span>
  );
}
