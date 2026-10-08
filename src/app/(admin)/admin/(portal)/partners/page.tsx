import type { Metadata } from "next";
import { Suspense } from "react";
import { PartnersView } from "@/components/admin/partners/PartnersView";

export const metadata: Metadata = { title: "Partners" };

export default function AdminPartnersPage() {
  return (
    <Suspense>
      <PartnersView />
    </Suspense>
  );
}
