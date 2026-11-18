"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import {
  PASSWORD_MIN_LENGTH,
  compact,
  hasErrors,
  validateConfirm,
  validateEmail,
  validateName,
  validateNewPassword,
  validatePhone,
  type Errors,
} from "@/features/auth/validation";
import { partnerLoginUrl } from "@/features/partners/redirect";
import { validateAddress, validateCompany } from "@/features/partners/validation";
import { partnerAuthService } from "@/services/partner-auth";
import { errorMessage, isServiceError } from "@/services/errors";

type Field = "name" | "companyName" | "email" | "phone" | "password" | "confirm" | "address";

export function PartnerRegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", companyName: "", email: "", phone: "", password: "", confirm: "", address: "" });
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, ...(field === "password" ? { confirm: undefined } : {}) }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = compact<Field>({
      name: validateName(values.name),
      companyName: validateCompany(values.companyName),
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      password: validateNewPassword(values.password),
      confirm: validateConfirm(values.password, values.confirm),
      address: validateAddress(values.address),
    });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await partnerAuthService.register({
        name: values.name,
        companyName: values.companyName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        address: values.address,
      });
      // Registration does not sign anyone in: the partner logs in next.
      router.replace(partnerLoginUrl({ registered: "1" }));
    } catch (err) {
      if (isServiceError(err) && err.field && err.field in values) setErrors({ [err.field]: err.message });
      else setFormError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your partner account"
      subtitle="List your vehicles, set your availability and follow every reservation from one dashboard."
      footer={
        <>
          Already a partner?{" "}
          <Link href={partnerLoginUrl()} className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <FormField label="Full name" name="name" autoComplete="name" value={values.name} error={errors.name} onChange={set("name")} />
        <FormField
          label="Business / company name (optional)"
          name="companyName"
          autoComplete="organization"
          value={values.companyName}
          error={errors.companyName}
          onChange={set("companyName")}
        />
        <FormField label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={values.email} error={errors.email} onChange={set("email")} />
        <FormField label="Phone number" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={values.phone} error={errors.phone} onChange={set("phone")} />
        <FormField
          label="Address"
          name="address"
          autoComplete="street-address"
          value={values.address}
          error={errors.address}
          onChange={set("address")}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          autoComplete="new-password"
          revealable
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          value={values.password}
          error={errors.password}
          onChange={set("password")}
        />
        <FormField
          label="Confirm password"
          type="password"
          name="confirm"
          autoComplete="new-password"
          revealable
          value={values.confirm}
          error={errors.confirm}
          onChange={set("confirm")}
        />
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create Partner Account"}
        </Button>
      </form>
    </AuthCard>
  );
}
