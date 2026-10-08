import type { Metadata } from "next";
import { PartnerForgotPasswordForm } from "@/components/partner/PartnerForgotPasswordForm";

export const metadata: Metadata = { title: "Reset partner password" };

export default function PartnerForgotPasswordPage() {
  return <PartnerForgotPasswordForm />;
}
