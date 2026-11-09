"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
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
import { loginUrl, safeNext } from "@/features/auth/redirect";
import { errorMessage, isServiceError } from "@/services/errors";
import { useRedirectIfAuthenticated } from "./AuthGuard";
import { useAuth } from "./AuthProvider";
import { AuthCard } from "./AuthCard";

type Field = "name" | "email" | "phone" | "password" | "confirm";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next");
  const next = safeNext(rawNext);
  const { register } = useAuth();
  const status = useRedirectIfAuthenticated(next);

  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", phone: "", password: "", confirm: "" });
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
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      password: validateNewPassword(values.password),
      confirm: validateConfirm(values.password, values.confirm),
    });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await register({ name: values.name, email: values.email, phone: values.phone, password: values.password });
      router.replace(next);
    } catch (err) {
      if (isServiceError(err) && err.field && err.field in values) {
        setErrors({ [err.field]: err.message });
      } else {
        setFormError(errorMessage(err));
      }
      setSubmitting(false);
    }
  }

  const busy = submitting || status === "authenticated";

  return (
    <AuthCard
      title="Create your account"
      subtitle="Reserve verified cars and keep every trip in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link href={loginUrl(rawNext ? next : undefined)} className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <FormField label="Full name" name="name" autoComplete="name" value={values.name} error={errors.name} onChange={set("name")} />
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          error={errors.email}
          onChange={set("email")}
        />
        <FormField
          label="Phone number"
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          value={values.phone}
          error={errors.phone}
          onChange={set("phone")}
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
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthCard>
  );
}
