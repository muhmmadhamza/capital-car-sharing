import type { Metadata } from "next";
import { PartnerDetailsView } from "@/components/admin/partners/PartnerDetailsView";

export const metadata: Metadata = { title: "Partner details" };

export default async function AdminPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PartnerDetailsView id={id} />;
}
