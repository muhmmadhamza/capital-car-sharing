import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };

export default function ResetPasswordPage() {
  // useSearchParams() needs a Suspense boundary.
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
