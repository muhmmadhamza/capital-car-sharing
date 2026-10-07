"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { FormField } from "@/components/ui/FormField";
import { validateEmail } from "@/features/auth/validation";
import { AuthCard } from "./AuthCard";

/**
 * Mock: nothing is sent. The API will email a single-use reset link and always
 * show this same message, so the form never reveals which emails have accounts.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateEmail(email);
    setError(found);
    if (!found) setSent(true);
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
      {sent ? (
        <p role="status" className="flex items-start gap-2 rounded-lg border border-[#1E6B45]/25 bg-[#E7F4EC] px-4 py-3 text-sm text-[#14543A]">
          <CheckIcon width={18} height={18} className="mt-0.5 shrink-0" />
          If an account exists for {email.trim()}, a reset link is on its way. Password reset emails will be live once the backend is connected.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
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
          <Button type="submit" size="lg" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
