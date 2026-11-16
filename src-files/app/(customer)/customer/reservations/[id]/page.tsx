import type { Metadata } from "next";
import { ReservationDetails } from "@/components/customer/ReservationDetails";

export const metadata: Metadata = { title: "Reservation details" };

export default async function ReservationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReservationDetails id={id} />;
}
