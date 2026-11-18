"use client";

import { useState } from "react";
import type { Car } from "@/types/car";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/Icons";
import { CarImageView } from "./CarImageView";

export function CarGallery({ car }: { car: Car }) {
  const [index, setIndex] = useState(0);
  const images = car.images.length ? car.images : [{ alt: `${car.make} ${car.model}`, label: "Exterior" }];
  const current = images[index];
  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy-900"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${car.make} ${car.model} photos`}
      >
        <CarImageView car={car} image={current} variant={index} />
        {!current.src ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-navy-900">
            {current.label} · placeholder
          </span>
        ) : null}
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow hover:bg-white"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow hover:bg-white"
            >
              <ChevronRightIcon />
            </button>
          </>
        ) : null}
        <p className="sr-only" aria-live="polite">
          Photo {index + 1} of {images.length}: {current.label}
        </p>
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <li key={img.label}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${img.label.toLowerCase()} photo`}
                aria-pressed={i === index}
                className={cn(
                  "block aspect-[16/10] w-full overflow-hidden rounded-lg border-2 transition-opacity",
                  i === index ? "border-gold-500" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <CarImageView car={car} image={img} variant={i} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
