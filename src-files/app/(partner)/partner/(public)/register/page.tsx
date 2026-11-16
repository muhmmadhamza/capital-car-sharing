import type { Metadata } from "next";
import { PartnerRegisterForm } from "@/components/partner/PartnerRegisterForm";

export const metadata: Metadata = { title: "Create partner account" };

export default function PartnerRegisterPage() {
  return <PartnerRegisterForm />;
}
