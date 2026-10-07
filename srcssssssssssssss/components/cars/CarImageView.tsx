import type { Car, CarImage } from "@/types/car";
import { cn } from "@/lib/utils";
import { CarIllustration } from "./CarIllustration";

/**
 * Renders a real photo when `image.src` exists, otherwise the placeholder
 * illustration. Cards and the gallery both use this, so adding photos later
 * needs no component changes, only `images[].src` in the data.
 */
export function CarImageView({
  car,
  image,
  variant = 0,
  className,
}: {
  car: Pick<Car, "bodyType" | "paint" | "make" | "model">;
  image?: CarImage;
  /** Placeholder only: picks a background so gallery slides look distinct. */
  variant?: number;
  className?: string;
}) {
  if (image?.src) {
    // Plain <img>: photo hosts are not known yet. Swap for next/image once remotePatterns are set.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image.src} alt={image.alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  }

  const bg = ["bg-navy-900", "bg-navy-950", "bg-navy-700"][variant % 3];
  return (
    <div className={cn("flex h-full w-full items-center justify-center px-6", bg, className)}>
      <CarIllustration
        type={car.bodyType}
        mode={variant % 2 === 1 ? "line" : "solid"}
        paint={car.paint}
        className="h-auto w-full max-w-[34rem]"
      />
      <span className="sr-only">{`${car.make} ${car.model} placeholder image`}</span>
    </div>
  );
}
