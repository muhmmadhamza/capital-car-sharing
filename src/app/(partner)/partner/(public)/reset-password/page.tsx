import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnerResetPasswordForm } from "@/components/partner/PartnerResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };

export default function PartnerResetPasswordPage() {
  // useSearchParams() needs a Suspense boundary.
  return (
    <Suspense>
      <PartnerResetPasswordForm />
    </Suspense>
  );
}
