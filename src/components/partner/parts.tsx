import { CarImageView } from "@/components/cars/CarImageView";
import { CAR_STATUS_LABELS } from "@/features/partners/catalog";
import { cn } from "@/lib/utils";
import type { CarImage } from "@/types/car";
import type { PartnerCar, PartnerCarStatus } from "@/types/partner";

/** Same pill shape and palette as the customer StatusBadge, so statuses look alike everywhere. */
const styles: Record<PartnerCarStatus, string> = {
  available: "border-[#1E6B45]/25 bg-[#E7F4EC] text-[#14543A]",
  booked: "border-navy-700/25 bg-navy-900/[0.06] text-navy-900",
  unavailable: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
  pending: "border-gold-700/30 bg-gold-500/15 text-navy-900",
};

const dots: Record<PartnerCarStatus, string> = {
  available: "bg-[#1E6B45]",
  booked: "bg-navy-700",
  unavailable: "bg-[#B3261E]",
  pending: "bg-gold-700",
};

export function CarStatusBadge({ status, className }: { status: PartnerCarStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-snug", styles[status], className)}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {CAR_STATUS_LABELS[status]}
    </span>
  );
}

const PAINTS = ["#E9EDF4", "#7C8DA8", "#2B3A55", "#C9CED8", "#8E1D17", "#1E6B45"];

/** Placeholder paint colour that stays the same for a given car. */
function paintFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PAINTS[h % PAINTS.length];
}

/** A partner's photo when there is one, the placeholder illustration otherwise. */
export function PartnerCarImage({
  car,
  image,
  variant,
  className,
}: {
  car: Pick<PartnerCar, "id" | "type" | "make" | "model" | "images">;
  image?: CarImage;
  variant?: number;
  className?: string;
}) {
  return (
    <CarImageView
      car={{ bodyType: car.type, paint: paintFor(car.id), make: car.make, model: car.model }}
      image={image ?? car.images[0]}
      variant={variant}
      className={className}
    />
  );
}

export function StatCard({ label, value, hint, tone, className }: { label: string; value: number | undefined; hint?: string; tone: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card", className)}>
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone)} />
      <p className="text-sm font-medium text-navy-700">{label}</p>
      {value === undefined ? (
        <div aria-hidden="true" className="mt-2 h-9 w-12 animate-pulse rounded-lg bg-navy-900/[0.07]" />
      ) : (
        <p className="mt-1 font-display text-4xl font-semibold text-navy-900">{value}</p>
      )}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** "BMW 3 Series" */
export const carName = (car: Pick<PartnerCar, "make" | "model">) => `${car.make} ${car.model}`;
