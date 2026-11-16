import type { Metadata } from "next";
import { VerificationDetailsView } from "@/components/admin/verifications/VerificationDetailsView";

export const metadata: Metadata = { title: "Verification details" };

export default async function AdminVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VerificationDetailsView id={id} />;
}
