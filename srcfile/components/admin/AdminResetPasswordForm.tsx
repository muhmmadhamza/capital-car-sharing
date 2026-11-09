"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { ADMIN_FORGOT_PATH, ADMIN_LOGIN_PATH } from "@/features/admin/redirect";
import { compact, hasErrors, validateConfirm, validateNewPassword, type Errors } from "@/features/auth/validation";
import { adminPasswordReset } from "@/services/admin/password-reset.service";
import { errorMessage } from "@/services/errors";
import { AdminAuthLayout } from "./AdminAuthLayout";

type Field = "password" | "confirm";

// The API requires a letter and a number (8-72 characters); check the same here for instant feedback.
function validatePassword(value: string): string | undefined {
  const base = validateNewPassword(value);
  if (base) return base;
  if (value.length > 72) return "Use at most 72 characters.";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "Include at least one letter and one number.";
}

export function AdminResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = compact<Field>({ password: validatePassword(password), confirm: validateConfirm(password, confirm) });
    setErrors(found);
    setFormError(undefined);
    if (hasErrors(found)) return;

    setSubmitting(true);
    try {
      await adminPasswordReset.reset(token, password);
      setDone(true);
      setTimeout(() => router.replace(ADMIN_LOGIN_PATH), 2500);
    } catch (err) {
      setFormError(errorMessage(err));
      setSubmitting(false);
    }
  }

  const footer = (
    <Link href={ADMIN_LOGIN_PATH} className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
      Back to admin login
    </Link>
  );

  if (!token) {
    return (
      <AdminAuthLayout title="Reset link invalid" footer={footer}>
        <FormAlert>
          This reset link is missing or invalid.{" "}
          <Link href={ADMIN_FORGOT_PATH} className="underline">
            Request a new one
          </Link>
          .
        </FormAlert>
      </AdminAuthLayout>
    );
  }

  return (
    <AdminAuthLayout title="Choose a new password" subtitle="Use at least 8 characters, with a letter and a number." footer={footer}>
      {done ? (
        <p role="status" className="rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
          Your password has been reset. Redirecting you to the login page…
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError ? (
            <FormAlert>
              {formError}{" "}
              <Link href={ADMIN_FORGOT_PATH} className="underline">
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
          <Button type="submit" variant="navy" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Saving…" : "Reset password"}
          </Button>
        </form>
      )}
    </AdminAuthLayout>
  );
}
