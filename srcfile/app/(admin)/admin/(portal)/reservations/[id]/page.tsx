import type { Metadata } from "next";
import { ReservationDetailsView } from "@/components/admin/reservations/ReservationDetailsView";

export const metadata: Metadata = { title: "Reservation details" };

export default async function AdminReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReservationDetailsView id={id} />;
}
