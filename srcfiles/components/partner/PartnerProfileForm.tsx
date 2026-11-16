"use client";

import { useRef, useState, type FormEvent } from "react";
import { PageHeader, panel } from "@/components/customer/States";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { CameraIcon, CheckIcon } from "@/components/ui/Icons";
import { compact, hasErrors, validateEmail, validateName, validatePhone, type Errors } from "@/features/auth/validation";
import { validateAddress, validateCompany } from "@/features/partners/validation";
import { formatIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { errorMessage, isServiceError } from "@/services/errors";
import { partnerAuthService } from "@/services/partner-auth";
import { usePartnerAuth } from "./PartnerAuthProvider";

type Field = "name" | "companyName" | "email" | "phone" | "address";

export function PartnerProfileForm() {
  const { partner, updateProfile } = usePartnerAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const read = () => ({
    name: partner?.name ?? "",
    companyName: partner?.companyName ?? "",
    email: partner?.email ?? "",
    phone: partner?.phone ?? "",
    address: partner?.address ?? "",
  });

  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(read);
  // undefined = unchanged, null = remove, string = new image
  const [avatar, setAvatar] = useState<string | null | undefined>(undefined);
  const [errors, setErrors] = useState<Errors<Field | "avatar">>({});
  const [formError, setFormError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!partner) return null;
  const shownAvatar = avatar === undefined ? partner.avatar : (avatar ?? undefined);

  function startEdit() {
    setValues(read());
    setAvatar(undefined);
    setErrors({});
    setFormError(undefined);
    setSaved(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setErrors({});
    setFormError(undefined);
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setErrors((p) => ({ ...p, avatar: undefined }));
    try {
      setAvatar(await partnerAuthService.uploadAvatar(file));
    } catch (err) {
      setErrors((p) => ({ ...p, avatar: errorMessage(err) }));
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    const found = compact<Field>({
      name: validateName(values.name),
      companyName: validateCompany(values.companyName),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      address: validateAddress(values.address),
    });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      await updateProfile({ ...values, avatar });
      setEditing(false);
      setSaved(true);
    } catch (err) {
      if (isServiceError(err) && err.field && err.field in values) setErrors({ [err.field]: err.message });
      else setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const readOnly = (label: string, value: string, wide?: boolean) => (
    <div className={cn("py-3", wide && "sm:col-span-2")}>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-navy-900">{value || "Not provided"}</dd>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Your contact details, shown to Capital Car Sharing and used for reservation updates."
        action={!editing ? <Button onClick={startEdit} variant="navy">Edit Profile</Button> : undefined}
      />

      {saved ? (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-[#1E6B45]/25 bg-[#E7F4EC] px-4 py-3 text-sm font-medium text-[#14543A]">
          <CheckIcon width={18} height={18} /> Your profile has been saved.
        </p>
      ) : null}

      <form onSubmit={onSave} noValidate className={cn(panel, "p-5 sm:p-8")}>
        <div className="flex flex-col items-center gap-5 border-b border-navy-900/10 pb-6 sm:flex-row sm:items-center">
          <Avatar name={values.name || partner.name} src={shownAvatar} className="h-24 w-24 text-3xl" />
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-navy-900">{partner.companyName || partner.name}</p>
            <p className="text-sm text-muted">Partner since {formatIsoDate(partner.createdAt)}</p>
            {editing ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={onPickFile} aria-label="Upload profile image" tabIndex={-1} />
                <Button variant="outline-navy" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <CameraIcon width={16} height={16} /> {uploading ? "Uploading…" : "Change image"}
                </Button>
                {shownAvatar ? (
                  <Button variant="outline-navy" onClick={() => setAvatar(null)}>
                    Remove
                  </Button>
                ) : null}
              </div>
            ) : null}
            {errors.avatar ? <p className="mt-2 text-xs font-medium text-[#8E1D17]">{errors.avatar}</p> : null}
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-4">
            {formError ? <FormAlert>{formError}</FormAlert> : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" name="name" autoComplete="name" value={values.name} error={errors.name} onChange={set("name")} />
              <FormField label="Company name (optional)" name="companyName" autoComplete="organization" value={values.companyName} error={errors.companyName} onChange={set("companyName")} />
              <FormField label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={values.email} error={errors.email} onChange={set("email")} />
              <FormField label="Phone number" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={values.phone} error={errors.phone} onChange={set("phone")} />
              <FormField label="Address" name="address" autoComplete="street-address" value={values.address} error={errors.address} onChange={set("address")} className="sm:col-span-2" />
            </div>
            <p className="text-xs text-muted">Account created {formatIsoDate(partner.createdAt)} (cannot be changed).</p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button type="submit" disabled={saving || uploading}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              <Button variant="outline-navy" onClick={cancelEdit} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <dl className="mt-2 grid divide-y divide-navy-900/10 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
            {readOnly("Full name", partner.name)}
            {readOnly("Company name", partner.companyName ?? "")}
            {readOnly("Email", partner.email)}
            {readOnly("Phone number", partner.phone)}
            {readOnly("Address", partner.address, true)}
            {readOnly("Account created", formatIsoDate(partner.createdAt))}
          </dl>
        )}
      </form>
    </div>
  );
}
