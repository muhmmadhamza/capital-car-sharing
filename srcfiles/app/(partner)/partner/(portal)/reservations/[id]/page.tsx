import type { Metadata } from "next";
import { PartnerReservationDetails } from "@/components/partner/PartnerReservationDetails";

export const metadata: Metadata = { title: "Reservation details" };

export default async function PartnerReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PartnerReservationDetails id={id} />;
}
