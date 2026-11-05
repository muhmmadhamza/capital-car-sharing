import type { Metadata } from "next";
import { VerificationView } from "@/components/customer/verification/VerificationView";

export const metadata: Metadata = { title: "Identity verification" };

export default function VerificationPage() {
  return <VerificationView />;
}
