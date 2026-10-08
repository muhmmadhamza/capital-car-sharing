import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin login" };

export default function AdminLoginPage() {
  // useSearchParams() needs a Suspense boundary so the rest of the page can render statically.
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
