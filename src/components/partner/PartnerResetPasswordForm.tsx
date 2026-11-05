"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { compact, hasErrors, validateConfirm, validateResetPassword, type Errors } from "@/features/auth/validation";
import { PARTNER_FORGOT_PATH, PARTNER_LOGIN_PATH } from "@/features/partners/redirect";
import { partnerPasswordReset } from "@/services/auth/password-reset.service";
import { errorMessage } from "@/services/errors";

type Field = "password" | "confirm";

/** partner reset-password: the emailed link carries the token as ?token=. After success we go to the partner login. */
export function PartnerResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const found = compact<Field>({ password: validateResetPassword(password), confirm: validateConfirm(password, confirm) });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await partnerPasswordReset.reset(token, password);
      setDone(true);
      timer.current = setTimeout(() => router.replace(PARTNER_LOGIN_PATH), 2500);
    } catch (err) {
      setFormError(errorMessage(err));
      setSubmitting(false);
    }
  }

  const footer = (
    <Link href={PARTNER_LOGIN_PATH} className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
      Back to partner login
    </Link>
  );

  if (!token) {
    return (
      <AuthCard title="Reset link invalid" footer={footer}>
        <FormAlert>
          This reset link is missing or invalid.{" "}
          <Link href={PARTNER_FORGOT_PATH} className="underline">
            Request a new one
          </Link>
          .
        </FormAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Use at least 8 characters, with a letter and a number." footer={footer}>
      {done ? (
        <p role="status" className="rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
          Your password has been reset. Redirecting you to the login page…
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError ? (
            <FormAlert>
              {formError}{" "}
              <Link href={PARTNER_FORGOT_PATH} className="underline">
                Request a new link
              </Link>
            </FormAlert>
          ) : null}
          <FormField
            label="New password"
            type="password"
            autoComplete="new-password"
            revealable
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
          />
          <FormField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            revealable
            value={confirm}
            error={errors.confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setErrors((p) => ({ ...p, confirm: undefined }));
            }}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Reset password"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
