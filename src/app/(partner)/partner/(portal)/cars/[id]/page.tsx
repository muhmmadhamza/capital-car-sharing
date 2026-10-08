import type { Metadata } from "next";
import { CarDetailsView } from "@/components/partner/CarDetailsView";

export const metadata: Metadata = { title: "Car details" };

export default async function PartnerCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CarDetailsView id={id} />;
}
