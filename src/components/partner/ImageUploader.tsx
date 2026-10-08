"use client";

import { useRef, useState } from "react";
import { PartnerCarImage } from "./parts";
import { ImageIcon } from "@/components/ui/Icons";
import { MAX_CAR_IMAGES } from "@/features/partners/catalog";
import { errorMessage } from "@/services/errors";
import { partnerData } from "@/services/partner";
import type { CarImage } from "@/types/car";
import { cn } from "@/lib/utils";

/**
 * Photo gallery editor. The first photo is the cover shown on cards. Uploading
 * goes through partnerData.uploadCarImage so real storage can replace the mock.
 */
export function ImageUploader({
  images,
  onChange,
  alt,
  error,
}: {
  images: CarImage[];
  onChange: (images: CarImage[]) => void;
  /** Used for alt text of new photos, e.g. "Toyota Corolla". */
  alt: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const full = images.length >= MAX_CAR_IMAGES;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files: File[] = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setProblem(undefined);
    setBusy(true);
    const added: CarImage[] = [];
    let failure: string | undefined;
    for (const file of files.slice(0, MAX_CAR_IMAGES - images.length)) {
      try {
        const src = await partnerData.uploadCarImage(file);
        added.push({ src, alt: `${alt || "Car"} photo ${images.length + added.length + 1}`, label: `Photo ${images.length + added.length + 1}` });
      } catch (err) {
        failure = errorMessage(err);
      }
    }
    if (files.length > MAX_CAR_IMAGES - images.length) failure = failure ?? `You can add up to ${MAX_CAR_IMAGES} photos.`;
    if (added.length) onChange([...images, ...added]);
    setProblem(failure);
    setBusy(false);
  }

  const makeCover = (i: number) => onChange([images[i], ...images.filter((_, j) => j !== i)]);
  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-navy-900">Photos</span>
        <span className="text-xs text-muted">
          {images.length} of {MAX_CAR_IMAGES}
        </span>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <li key={`${img.src?.slice(-24) ?? img.label}-${i}`} className="overflow-hidden rounded-xl border border-navy-900/15 bg-white">
            <div className="relative aspect-[4/3]">
              <PartnerCarImage car={{ id: alt, type: "sedan", make: alt, model: "", images }} image={img} variant={i} />
              {i === 0 ? (
                <span className="absolute left-2 top-2 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-semibold text-navy-950">Cover</span>
              ) : null}
            </div>
            <div className="flex divide-x divide-navy-900/10 border-t border-navy-900/10 text-xs font-semibold">
              {i !== 0 ? (
                <button type="button" onClick={() => makeCover(i)} className="h-10 flex-1 text-navy-900 hover:bg-navy-900/5">
                  Make cover
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${img.label}`}
                className={cn("h-10 flex-1 text-[#8E1D17] hover:bg-[#FBEAE9]")}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
        {!full ? (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex aspect-[4/3] h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-navy-900/25 text-sm font-medium text-navy-700 transition-colors hover:border-gold-700 hover:bg-gold-500/10 disabled:opacity-60"
            >
              <ImageIcon width={24} height={24} className="text-gold-700" />
              {busy ? "Uploading…" : "Add photos"}
            </button>
          </li>
        ) : null}
      </ul>

      <input ref={inputRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-label="Upload car photos" onChange={onPick} />
      <p className="mt-2 text-xs text-muted">The first photo is the cover. Without photos, a placeholder illustration is shown.</p>
      {problem || error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[#8E1D17]">
          {problem ?? error}
        </p>
      ) : null}
    </div>
  );
}
