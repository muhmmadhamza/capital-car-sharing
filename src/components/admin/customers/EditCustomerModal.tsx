"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { compact, hasErrors, validateEmail, validateName, validatePhone, type Errors } from "@/features/auth/validation";
import { errorMessage, isServiceError } from "@/services/errors";
import { updateCustomer } from "@/services/admin/customer.service";
import type { AdminCustomer, AdminCustomerRow } from "@/types/admin";
import { Modal } from "../ui";

type Field = "name" | "email" | "phone";

/** Edit a customer's contact details. Status has its own Activate/Deactivate action. */
export function EditCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: Pick<AdminCustomer, "id" | "name" | "email" | "phone">;
  onClose: () => void;
  onSaved: (row: AdminCustomerRow) => void;
}) {
  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = compact<Field>({ name: validateName(name), email: validateEmail(email), phone: validatePhone(phone) });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSaving(true);
    try {
      const row = await updateCustomer(customer.id, { name, email, phone });
      onSaved(row);
    } catch (err) {
      if (isServiceError(err) && err.field && (["name", "email", "phone"] as string[]).includes(err.field)) {
        setErrors({ [err.field]: err.message });
      } else {
        setFormError(errorMessage(err));
      }
      setSaving(false);
    }
  }

  const clear = (f: Field) => setErrors((prev) => ({ ...prev, [f]: undefined }));

  return (
    <Modal title="Edit customer" description="Update the contact details on this account." onClose={onClose} busy={saving}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <FormField
          label="Full name"
          name="name"
          autoComplete="off"
          value={name}
          error={errors.name}
          onChange={(e) => {
            setName(e.target.value);
            clear("name");
          }}
        />
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="off"
          inputMode="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
        />
        <FormField
          label="Phone"
          type="tel"
          name="phone"
          autoComplete="off"
          inputMode="tel"
          value={phone}
          error={errors.phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clear("phone");
          }}
        />
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
