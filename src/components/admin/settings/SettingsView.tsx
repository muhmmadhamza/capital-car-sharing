"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/FormControls";
import { CURRENCIES, settingsEqual, validateSettings, type SettingsErrors, type SettingsField } from "@/features/admin/settings";
import { useAsync } from "@/hooks/useAsync";
import { getSettings, updateSettings } from "@/services/admin/settings.service";
import { errorMessage, isServiceError } from "@/services/errors";
import type { AdminSettings } from "@/types/admin";
import { AdminCard } from "../controls";
import { ErrorState, LoadingRows, PageHeader, useAdminToast } from "../ui";

const FIELDS: SettingsField[] = ["platformName", "contactEmail", "contactPhone", "currency", "defaultDailyRate", "minRentalDays", "maxRentalDays"];

/** Text boxes keep what the admin typed; numbers are parsed when saving. */
type Draft = Omit<AdminSettings, "defaultDailyRate" | "minRentalDays" | "maxRentalDays"> & { defaultDailyRate: string; minRentalDays: string; maxRentalDays: string };

const toDraft = (s: AdminSettings): Draft => ({ ...s, defaultDailyRate: String(s.defaultDailyRate), minRentalDays: String(s.minRentalDays), maxRentalDays: String(s.maxRentalDays) });
const fromDraft = (d: Draft): AdminSettings => ({ ...d, defaultDailyRate: Number(d.defaultDailyRate), minRentalDays: Number(d.minRentalDays), maxRentalDays: Number(d.maxRentalDays) });

export function SettingsView() {
  const notify = useAdminToast();
  const { data, loading, error, reload, setData } = useAsync(getSettings, []);
  const [draft, setDraft] = useState<Draft>();
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(toDraft(data));
  }, [data]);

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Settings" description="Platform details and rental defaults." />
        <LoadingRows label="Loading settings" rows={5} />
      </>
    );
  }
  if (error && !data) {
    return (
      <>
        <PageHeader title="Settings" description="Platform details and rental defaults." />
        <ErrorState message={error} onRetry={reload} />
      </>
    );
  }
  if (!data || !draft) return null;

  const dirty = !settingsEqual(fromDraft(draft), data);

  function change<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(undefined);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!draft) return;
    const next = fromDraft(draft);
    const found = validateSettings(next);
    setErrors(found);
    setFormError(undefined);
    if (Object.values(found).some(Boolean)) return;

    setSaving(true);
    try {
      const saved = await updateSettings(next);
      setData(saved);
      setDraft(toDraft(saved));
      notify("Settings saved.");
    } catch (err) {
      if (isServiceError(err) && err.field && (FIELDS as string[]).includes(err.field)) {
        setErrors({ [err.field]: err.message });
      } else {
        setFormError(errorMessage(err));
      }
      notify("Settings were not saved. Check the form and try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function onDiscard() {
    if (!data) return;
    setDraft(toDraft(data));
    setErrors({});
    setFormError(undefined);
  }

  return (
    <>
      <PageHeader title="Settings" description="Platform details and rental defaults. Changes are saved in this browser for the demo." />

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        {formError ? <FormAlert>{formError}</FormAlert> : null}

        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-2">
          <AdminCard title="Platform" description="How Capital Car Sharing presents itself and how customers reach it.">
            <div className="space-y-4">
              <FormField label="Platform name" name="platformName" autoComplete="off" value={draft.platformName} error={errors.platformName} onChange={(e) => change("platformName", e.target.value)} />
              <FormField label="Contact email" name="contactEmail" type="email" inputMode="email" autoComplete="off" value={draft.contactEmail} error={errors.contactEmail} onChange={(e) => change("contactEmail", e.target.value)} />
              <FormField label="Contact phone" name="contactPhone" type="tel" inputMode="tel" autoComplete="off" value={draft.contactPhone} error={errors.contactPhone} onChange={(e) => change("contactPhone", e.target.value)} />
            </div>
          </AdminCard>

          <AdminCard title="Rental" description="Defaults used when partners list cars and customers book them.">
            <div className="space-y-4">
              <SelectField label="Default currency" value={draft.currency} error={errors.currency} onChange={(e) => change("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </SelectField>
              <FormField
                label="Default daily rate"
                name="defaultDailyRate"
                type="number"
                inputMode="decimal"
                min={1}
                step="1"
                value={draft.defaultDailyRate}
                error={errors.defaultDailyRate}
                hint="Suggested price when a partner lists a new car."
                onChange={(e) => change("defaultDailyRate", e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Minimum rental (days)" name="minRentalDays" type="number" inputMode="numeric" min={1} step="1" value={draft.minRentalDays} error={errors.minRentalDays} onChange={(e) => change("minRentalDays", e.target.value)} />
                <FormField label="Maximum rental (days)" name="maxRentalDays" type="number" inputMode="numeric" min={1} step="1" value={draft.maxRentalDays} error={errors.maxRentalDays} onChange={(e) => change("maxRentalDays", e.target.value)} />
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {dirty ? <p className="text-sm text-muted sm:mr-auto" role="status">You have unsaved changes.</p> : null}
          <Button variant="outline-navy" onClick={onDiscard} disabled={!dirty || saving}>
            Discard changes
          </Button>
          <Button type="submit" variant="navy" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}
