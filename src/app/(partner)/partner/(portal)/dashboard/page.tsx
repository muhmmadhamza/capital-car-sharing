import type { Metadata } from "next";
import { PartnerDashboardView } from "@/components/partner/PartnerDashboardView";

export const metadata: Metadata = { title: "Partner overview" };

export default function PartnerDashboardPage() {
  return <PartnerDashboardView />;
}
