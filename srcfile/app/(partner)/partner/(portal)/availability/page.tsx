import type { Metadata } from "next";
import { Suspense } from "react";
import { AvailabilityManager } from "@/components/partner/AvailabilityManager";

export const metadata: Metadata = { title: "Availability" };

export default function AvailabilityPage() {
  // useSearchParams() (the ?car= choice) needs a Suspense boundary.
  return (
    <Suspense>
      <AvailabilityManager />
    </Suspense>
  );
}
