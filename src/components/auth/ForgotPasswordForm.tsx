"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { validateEmail } from "@/features/auth/validation";
import { customerPasswordReset } from "@/services/auth/password-reset.service";
import { errorMessage } from "@/services/errors";
import { AuthCard } from "./AuthCard";

/** Customer forgot-password. The API answers the same way whether or not the email has an account. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const found = validateEmail(email);
    setError(found);
    setFormError(undefined);
    if (found) return;

    setSubmitting(true);
    try {
      setMessage(await customerPasswordReset.request(email));
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send you a link to choose a new password."
      footer={
        <Link href="/login" className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
          Back to log in
        </Link>
      }
    >
      {message ? (
        <p role="status" className="rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
          {message} The link is valid for a limited time and can be used once.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError ? <FormAlert>{formError}</FormAlert> : null}
          <FormField
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
          />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
