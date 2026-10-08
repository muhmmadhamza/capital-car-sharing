import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnerLoginForm } from "@/components/partner/PartnerLoginForm";

export const metadata: Metadata = { title: "Partner login" };

export default function PartnerLoginPage() {
  // useSearchParams() needs a Suspense boundary so the rest of the page can render statically.
  return (
    <Suspense>
      <PartnerLoginForm />
    </Suspense>
  );
}
