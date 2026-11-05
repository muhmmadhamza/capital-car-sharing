"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { ADMIN_FORGOT_PATH, safeAdminNext } from "@/features/admin/redirect";
import { compact, hasErrors, validateEmail, type Errors } from "@/features/auth/validation";
import { errorMessage } from "@/services/errors";
import { AdminAuthLayout } from "./AdminAuthLayout";
import { FullPageSpinner, useAdminAuth, useAdminRedirectIfAuthenticated } from "./AdminAuthProvider";

type Field = "email" | "password";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeAdminNext(params.get("next"));
  const { login } = useAdminAuth();
  const status = useAdminRedirectIfAuthenticated(next);

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

  // A signed-in admin is on their way to /admin; show nothing but a spinner instead of the form.
  if (status === "authenticated" && !submitting) return <FullPageSpinner label="Redirecting to the dashboard" />;
  const busy = submitting || status === "authenticated";

  return (
    <AdminAuthLayout title="Admin login" subtitle="Sign in with your staff account to manage Capital Car Sharing.">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
        <FormField
          label="Email"
          type="email"
          name="email"
          autoComplete="username"
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
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-navy-900/30 accent-[#C9A24B]" />
            Remember me
          </label>
          <Link href={ADMIN_FORGOT_PATH} className="text-sm font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" variant="navy" size="lg" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </Button>
      </form>

    </AdminAuthLayout>
  );
}
