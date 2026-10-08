"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { CheckIcon } from "@/components/ui/Icons";
import { DEMO_PARTNER_CREDENTIALS } from "@/data/mock/partners";
import { compact, hasErrors, validateEmail, type Errors } from "@/features/auth/validation";
import { PARTNER_FORGOT_PATH, PARTNER_REGISTER_PATH, safePartnerNext } from "@/features/partners/redirect";
import { errorMessage } from "@/services/errors";
import { usePartnerAuth, usePartnerRedirectIfAuthenticated } from "./PartnerAuthProvider";

type Field = "email" | "password";

export function PartnerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safePartnerNext(params.get("next"));
  const justRegistered = params.get("registered") === "1";
  const { login } = usePartnerAuth();
  const status = usePartnerRedirectIfAuthenticated(next);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = compact<Field>({ email: validateEmail(email), password: password ? undefined : "Enter your password." });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await login({ email, password, remember });
      router.replace(next);
    } catch (err) {
      setFormError(errorMessage(err));
      setSubmitting(false);
    }
  }

  const clear = (field: Field) => setErrors((prev) => ({ ...prev, [field]: undefined }));
  const busy = submitting || status === "authenticated";

  return (
    <AuthCard
      title="Partner login"
      subtitle="Sign in to manage your cars, availability and reservations."
      footer={
        <>
          New partner?{" "}
          <Link href={PARTNER_REGISTER_PATH} className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
            Create Partner Account
          </Link>
          <span className="mt-3 block text-xs text-muted">
            Renting a car instead?{" "}
            <Link href="/login" className="font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
              Customer login
            </Link>
          </span>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {justRegistered ? (
          <p role="status" className="flex items-start gap-2 rounded-lg border border-[#1E6B45]/25 bg-[#E7F4EC] px-4 py-3 text-sm text-[#14543A]">
            <CheckIcon width={18} height={18} className="mt-0.5 shrink-0" />
            Your partner account is ready. Log in to continue.
          </p>
        ) : null}
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          error={errors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            clear("email");
          }}
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          revealable
          value={password}
          error={errors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            clear("password");
          }}
        />
        <div className="flex items-center justify-between gap-4">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-navy-900">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-navy-900/30 accent-[#C9A24B]"
            />
            Remember me
          </label>
          <Link href={PARTNER_FORGOT_PATH} className="text-sm font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>

      {/* Mock-only helper. Delete with the mock partner auth repository when the API goes live. */}
      <div className="mt-6 rounded-xl border border-gold-700/30 bg-gold-500/10 p-4 text-sm text-navy-900">
        <p className="font-semibold">Demo partner account</p>
        <p className="mt-1 text-navy-700">
          {DEMO_PARTNER_CREDENTIALS.email}
          <br />
          {DEMO_PARTNER_CREDENTIALS.password}
        </p>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_PARTNER_CREDENTIALS.email);
            setPassword(DEMO_PARTNER_CREDENTIALS.password);
            setErrors({});
            setFormError(undefined);
          }}
          className="mt-2 text-sm font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700"
        >
          Fill in demo details
        </button>
      </div>
    </AuthCard>
  );
}
