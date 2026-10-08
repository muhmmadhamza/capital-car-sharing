"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageHeader, panel } from "@/components/customer/States";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { SelectField, TextareaField } from "@/components/ui/FormControls";
import { CheckIcon, PlusIcon } from "@/components/ui/Icons";
import { CAR_STATUS_LABELS, CAR_TYPES, COMMON_FEATURES, EDITABLE_LISTING_STATUSES, FUEL_TYPES, TRANSMISSIONS } from "@/features/partners/catalog";
import { toCarInput, validateCarForm, type CarFormField, type CarFormValues } from "@/features/partners/validation";
import { cn } from "@/lib/utils";
import { errorMessage, isServiceError } from "@/services/errors";
import { partnerData } from "@/services/partner";
import { BODY_TYPE_LABELS, type CarImage } from "@/types/car";
import type { PartnerCarStatus, PartnerCarView } from "@/types/partner";
import { ImageUploader } from "./ImageUploader";
import { usePartnerAuth } from "./PartnerAuthProvider";

const blank = (): CarFormValues => ({
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  type: "sedan",
  seats: "5",
  doors: "4",
  transmission: "Automatic",
  fuelType: "Petrol",
  dailyPrice: "",
  location: "",
  description: "",
});

const fromCar = (c: PartnerCarView): CarFormValues => ({
  make: c.make,
  model: c.model,
  year: String(c.year),
  type: c.type,
  seats: String(c.seats),
  doors: String(c.doors),
  transmission: c.transmission,
  fuelType: c.fuelType,
  dailyPrice: String(c.dailyPrice),
  location: c.location,
  description: c.description,
});

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className={cn(panel, "p-5 sm:p-6")}>
      <h2 className="text-base font-semibold text-navy-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FeaturePicker({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState<string>();
  const common = new Set<string>(COMMON_FEATURES);
  const extras = value.filter((f) => !common.has(f));

  const toggle = (f: string) => onChange(value.includes(f) ? value.filter((x) => x !== f) : [...value, f]);

  function addCustom() {
    const f = custom.trim().replace(/\s+/g, " ");
    if (!f) return;
    if (f.length > 40) return setNote("Keep a feature under 40 characters.");
    if (value.some((x) => x.toLowerCase() === f.toLowerCase())) return setNote("That feature is already added.");
    onChange([...value, f]);
    setCustom("");
    setNote(undefined);
  }

  return (
    <fieldset>
      <legend className="sr-only">Features</legend>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {COMMON_FEATURES.map((f) => {
          const on = value.includes(f);
          return (
            <label
              key={f}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2 text-sm transition-colors",
                on ? "border-navy-900 bg-navy-900/[0.04] font-medium text-navy-900" : "border-navy-900/20 text-navy-700 hover:border-navy-900/40",
              )}
            >
              <input type="checkbox" checked={on} onChange={() => toggle(f)} className="h-4 w-4 shrink-0 rounded border-navy-900/30 accent-[#C9A24B]" />
              {f}
            </label>
          );
        })}
      </div>

      {extras.length ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Other features you added">
          {extras.map((f) => (
            <li key={f} className="inline-flex items-center gap-1.5 rounded-full border border-gold-700/30 bg-gold-500/15 py-1 pl-3 pr-1 text-sm text-navy-900">
              {f}
              <button
                type="button"
                onClick={() => toggle(f)}
                aria-label={`Remove ${f}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-navy-700 hover:bg-navy-900/10"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="custom-feature" className="mb-1.5 block text-sm font-medium text-navy-900">
            Other feature
          </label>
          <input
            id="custom-feature"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setNote(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="e.g. Ski rack"
            className="h-11 w-full rounded-lg border border-navy-900/20 bg-white px-3.5 text-sm text-ink placeholder:text-muted/80 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          />
        </div>
        <Button variant="outline-navy" onClick={addCustom}>
          <PlusIcon width={16} height={16} /> Add feature
        </Button>
      </div>
      {note ? <p className="mt-1.5 text-xs font-medium text-[#8E1D17]">{note}</p> : null}
    </fieldset>
  );
}

/**
 * One form for Add Car and Edit Car, so both always accept the same fields and
 * follow the same rules. The service layer decides where the data goes.
 */
export function CarForm({ mode, car }: { mode: "add" | "edit"; car?: PartnerCarView }) {
  const router = useRouter();
  const { partner } = usePartnerAuth();
  const [values, setValues] = useState<CarFormValues>(() => (car ? fromCar(car) : blank()));
  const [images, setImages] = useState<CarImage[]>(car?.images ?? []);
  const [features, setFeatures] = useState<string[]>(car?.features ?? []);
  const [listingStatus, setListingStatus] = useState<PartnerCarStatus>(car?.listingStatus ?? "available");
  const [errors, setErrors] = useState<Partial<Record<CarFormField, string>>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const set = (field: keyof CarFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!partner) return;
    const found = validateCarForm(values, images.length);
    setErrors(found);
    setFormError(undefined);
    if (Object.keys(found).length) {
      // Move to the first problem so nobody scrolls looking for it.
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setSaving(true);
    try {
      const input = toCarInput(values, images, features);
      const saved =
        mode === "add" || !car
          ? await partnerData.createCar(partner.id, input)
          : await partnerData.updateCar(partner.id, car.id, input, listingStatus);
      router.push(`/partner/cars?${mode === "add" ? "added" : "updated"}=${encodeURIComponent(saved.id)}`);
    } catch (err) {
      if (isServiceError(err) && err.field && err.field in values) setErrors({ [err.field]: err.message });
      else setFormError(errorMessage(err));
      setSaving(false);
    }
  }

  const canChangeListing = mode === "edit" && car && car.listingStatus !== "pending";
  const title = `${values.make} ${values.model}`.trim();

  return (
    <div>
      <PageHeader
        title={mode === "add" ? "Add Car" : `Edit ${car ? `${car.make} ${car.model}` : "car"}`}
        description={
          mode === "add"
            ? "Tell renters about your vehicle. New cars are reviewed before they go live."
            : "Changes appear in My Cars as soon as you save."
        }
      />

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <Section title="Photos" description="Clear, well-lit photos help your car get booked.">
          <ImageUploader images={images} onChange={(next) => { setImages(next); setErrors((p) => ({ ...p, images: undefined })); }} alt={title} error={errors.images} />
        </Section>

        <Section title="Vehicle details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Make" name="make" value={values.make} error={errors.make} onChange={set("make")} placeholder="Toyota" />
            <FormField label="Model" name="model" value={values.model} error={errors.model} onChange={set("model")} placeholder="Corolla" />
            <FormField label="Year" name="year" inputMode="numeric" value={values.year} error={errors.year} onChange={set("year")} />
            <SelectField label="Car type" value={values.type} onChange={set("type")}>
              {CAR_TYPES.map((t) => (
                <option key={t} value={t}>
                  {BODY_TYPE_LABELS[t]}
                </option>
              ))}
            </SelectField>
            <FormField label="Seats" name="seats" inputMode="numeric" value={values.seats} error={errors.seats} onChange={set("seats")} />
            <FormField label="Doors" name="doors" inputMode="numeric" value={values.doors} error={errors.doors} onChange={set("doors")} />
            <SelectField label="Transmission" value={values.transmission} onChange={set("transmission")}>
              {TRANSMISSIONS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </SelectField>
            <SelectField label="Fuel type" value={values.fuelType} onChange={set("fuelType")}>
              {FUEL_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </SelectField>
          </div>
        </Section>

        <Section title="Price and pickup">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Daily price"
              name="dailyPrice"
              inputMode="decimal"
              value={values.dailyPrice}
              error={errors.dailyPrice}
              onChange={set("dailyPrice")}
              placeholder="55"
              hint="What renters pay for each 24 hours."
            />
            <FormField
              label="Pickup location"
              name="location"
              value={values.location}
              error={errors.location}
              onChange={set("location")}
              placeholder="Street, area or landmark"
              hint="Where renters collect and return the car."
            />
            {canChangeListing ? (
              <SelectField label="Listing status" value={listingStatus} onChange={(e) => setListingStatus(e.target.value as PartnerCarStatus)} hint="Choose Unavailable to pause the whole listing.">
                {EDITABLE_LISTING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {CAR_STATUS_LABELS[s]}
                  </option>
                ))}
              </SelectField>
            ) : null}
          </div>
        </Section>

        <Section title="Description">
          <TextareaField
            label="About this car"
            name="description"
            rows={5}
            value={values.description}
            error={errors.description}
            onChange={set("description")}
            hint={`${values.description.trim().length}/1000. Mention comfort, condition and what it suits best.`}
          />
        </Section>

        <Section title="Features" description="Select everything your car has. Add anything we missed.">
          <FeaturePicker value={features} onChange={setFeatures} />
        </Section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" disabled={saving}>
            <CheckIcon width={18} height={18} /> {saving ? "Saving…" : mode === "add" ? "Save Car" : "Save Changes"}
          </Button>
          <Button variant="outline-navy" size="lg" onClick={() => router.push(car ? `/partner/cars/${car.id}` : "/partner/cars")} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
