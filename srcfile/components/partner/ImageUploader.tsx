"use client";

import { useRef, useState } from "react";
import { PartnerCarImage } from "./parts";
import { ImageIcon } from "@/components/ui/Icons";
import { CAR_IMAGE_TYPES, MAX_CAR_IMAGES, MAX_CAR_IMAGE_MB } from "@/features/partners/catalog";
import { errorMessage } from "@/services/errors";
import { partnerData } from "@/services/partner";
import type { CarImage } from "@/types/car";
import { cn } from "@/lib/utils";

/**
 * Photo gallery editor. The first photo is the cover shown on cards. Each file is uploaded through
 * partnerData.uploadCarImage with live progress. When `carId` is set (editing) the server saves the
 * photo to that car right away; for a new car only the file is stored and the URL is saved with the car.
 */
export function ImageUploader({
  images,
  onChange,
  alt,
  error,
  carId,
}: {
  images: CarImage[];
  onChange: (images: CarImage[]) => void;
  /** Used for alt text of new photos, e.g. "Toyota Corolla". */
  alt: string;
  error?: string;
  /** Id of the car being edited. Leave empty while adding a new car. */
  carId?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string>();
  const [done, setDone] = useState<string>();
  /** Which file is being sent: "2 of 3", and how far along it is. */
  const [progress, setProgress] = useState<{ index: number; total: number; percent: number; name: string }>();
  const full = images.length >= MAX_CAR_IMAGES;

  /** Checks a file in the browser first so obvious mistakes are explained at once. The server checks again. */
  function checkFile(file: File): string | undefined {
    if (!(CAR_IMAGE_TYPES as readonly string[]).includes(file.type)) return `"${file.name}" isn't supported. Use a JPG, PNG or WebP image.`;
    if (file.size > MAX_CAR_IMAGE_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_CAR_IMAGE_MB} MB.`;
    return undefined;
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files: File[] = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setProblem(undefined);
    setDone(undefined);

    const room = MAX_CAR_IMAGES - images.length;
    const batch = files.slice(0, room);
    const added: CarImage[] = [];
    const failures: string[] = [];
    if (files.length > room) failures.push(`You can add up to ${MAX_CAR_IMAGES} photos.`);

    setBusy(true);
    for (const [i, file] of batch.entries()) {
      const invalid = checkFile(file);
      if (invalid) {
        failures.push(invalid);
        continue;
      }
      setProgress({ index: i + 1, total: batch.length, percent: 0, name: file.name });
      try {
        const src = await partnerData.uploadCarImage(file, {
          carId,
          onProgress: (percent) => setProgress({ index: i + 1, total: batch.length, percent, name: file.name }),
        });
        added.push({ src, alt: `${alt || "Car"} photo ${images.length + added.length + 1}`, label: `Photo ${images.length + added.length + 1}` });
      } catch (err) {
        failures.push(`"${file.name}": ${errorMessage(err)}`);
      }
    }
    if (added.length) onChange([...images, ...added]);
    if (added.length) {
      const saved = carId ? "and saved to this car" : "and will be saved when you save the car";
      setDone(`${added.length === 1 ? "1 photo" : `${added.length} photos`} uploaded ${saved}.`);
    }
    setProblem(failures.length ? failures.join(" ") : undefined);
    setProgress(undefined);
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
              {busy ? (progress ? `Uploading… ${progress.percent}%` : "Uploading…") : "Add photos"}
            </button>
          </li>
        ) : null}
      </ul>

      <input ref={inputRef} type="file" accept={CAR_IMAGE_TYPES.join(",")} multiple className="sr-only" tabIndex={-1} aria-label="Upload car photos" onChange={onPick} />
      <p className="mt-2 text-xs text-muted">
        The first photo is the cover. JPG, PNG or WebP, up to {MAX_CAR_IMAGE_MB} MB each. Without photos, a placeholder illustration is shown.
      </p>
      {progress ? (
        <div role="status" aria-live="polite" className="mt-2">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-navy-900">
            <span className="truncate">
              Uploading photo {progress.index} of {progress.total}: {progress.name}
            </span>
            <span>{progress.percent}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-900/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
            <div className="h-full rounded-full bg-gold-500 transition-[width] duration-150" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      ) : null}
      {done && !busy ? (
        <p role="status" className="mt-1.5 text-xs font-medium text-[#14543A]">
          {done}
        </p>
      ) : null}
      {problem || error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[#8E1D17]">
          {problem ?? error}
        </p>
      ) : null}
    </div>
  );
}
