"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/FormControls";
import { compact, hasErrors, type Errors } from "@/features/auth/validation";
import { useAsync } from "@/hooks/useAsync";
import { getCarLocations, updateCar } from "@/services/admin/car.service";
import { errorMessage, isServiceError } from "@/services/errors";
import type { AdminCarUpdate, AdminCarView } from "@/types/admin";
import { BODY_TYPE_LABELS, type CarBodyType } from "@/types/car";
import { Modal } from "../ui";

type Field = "make" | "model" | "year" | "dailyPrice" | "locationId";
const FIELDS: string[] = ["make", "model", "year", "bodyType", "locationId", "dailyPrice", "status"];
const MAX_YEAR = new Date().getFullYear() + 1;

/** Edit a car's listing details. Approval has its own Approve / Reject / Suspend actions. */
export function EditCarModal({ car, onClose, onSaved }: { car: AdminCarView; onClose: () => void; onSaved: (row: AdminCarView) => void }) {
  const locations = useAsync(getCarLocations, []);
  const [make, setMake] = useState(car.make);
  const [model, setModel] = useState(car.model);
  const [year, setYear] = useState(String(car.year));
  const [bodyType, setBodyType] = useState<CarBodyType>(car.bodyType);
  const [locationId, setLocationId] = useState(car.locationId);
  const [dailyPrice, setDailyPrice] = useState(String(car.dailyPrice));
  const [status, setStatus] = useState<AdminCarUpdate["status"]>(car.status === "booked" ? "available" : car.status);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const booked = car.status === "booked";

  const clear = (f: Field) => setErrors((prev) => ({ ...prev, [f]: undefined }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const yearNumber = Number(year);
    const priceNumber = Number(dailyPrice);
    const found = compact<Field>({
      make: make.trim() ? undefined : "Enter the make.",
      model: model.trim() ? undefined : "Enter the model.",
      year: Number.isInteger(yearNumber) && yearNumber >= 1990 && yearNumber <= MAX_YEAR ? undefined : `Enter a year between 1990 and ${MAX_YEAR}.`,
      dailyPrice: Number.isFinite(priceNumber) && priceNumber > 0 ? undefined : "Enter a daily price above zero.",
      locationId: locationId ? undefined : "Choose a pickup location.",
    });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      const row = await updateCar(car.id, { make, model, year: yearNumber, bodyType, locationId, dailyPrice: priceNumber, status });
      onSaved(row);
    } catch (err) {
      if (isServiceError(err) && err.field && FIELDS.includes(err.field)) {
        setErrors({ [err.field]: err.message });
      } else {
        setFormError(errorMessage(err));
      }
      setSaving(false);
    }
  }

  return (
    <Modal title="Edit car" description={`${car.make} ${car.model} · ${car.partnerName}`} onClose={onClose} busy={saving}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Make" name="make" autoComplete="off" value={make} error={errors.make} onChange={(e) => (setMake(e.target.value), clear("make"))} />
          <FormField label="Model" name="model" autoComplete="off" value={model} error={errors.model} onChange={(e) => (setModel(e.target.value), clear("model"))} />
          <FormField label="Year" name="year" type="number" inputMode="numeric" min={1990} max={MAX_YEAR} value={year} error={errors.year} onChange={(e) => (setYear(e.target.value), clear("year"))} />
          <SelectField label="Car type" value={bodyType} onChange={(e) => setBodyType(e.target.value as CarBodyType)}>
            {(Object.keys(BODY_TYPE_LABELS) as CarBodyType[]).map((t) => (
              <option key={t} value={t}>
                {BODY_TYPE_LABELS[t]}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Location"
            value={locationId}
            error={errors.locationId}
            disabled={!locations.data}
            onChange={(e) => (setLocationId(e.target.value), clear("locationId"))}
          >
            {/* Until the list loads, keep the current branch selectable so the field is never blank. */}
            {!locations.data ? <option value={car.locationId}>{car.locationName}</option> : null}
            {(locations.data ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </SelectField>
          <FormField label="Daily price" name="dailyPrice" type="number" inputMode="decimal" min={1} step="1" value={dailyPrice} error={errors.dailyPrice} onChange={(e) => (setDailyPrice(e.target.value), clear("dailyPrice"))} />
        </div>
        <SelectField
          label="Availability"
          value={booked ? "booked" : status}
          disabled={booked}
          hint={booked ? "This car is out on a rental. It becomes available again when the rental ends." : "Unavailable hides the car from renters without changing its approval."}
          onChange={(e) => setStatus(e.target.value as AdminCarUpdate["status"])}
        >
          {booked ? <option value="booked">Booked</option> : null}
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </SelectField>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline-navy" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="navy" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
