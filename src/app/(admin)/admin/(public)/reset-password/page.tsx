import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminResetPasswordForm } from "@/components/admin/AdminResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };

export default function AdminResetPasswordPage() {
  // useSearchParams() needs a Suspense boundary.
  return (
    <Suspense>
      <AdminResetPasswordForm />
    </Suspense>
  );
}
