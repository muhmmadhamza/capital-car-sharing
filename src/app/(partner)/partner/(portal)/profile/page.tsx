import type { Metadata } from "next";
import { PartnerProfileForm } from "@/components/partner/PartnerProfileForm";

export const metadata: Metadata = { title: "Partner profile" };

export default function PartnerProfilePage() {
  return <PartnerProfileForm />;
}
