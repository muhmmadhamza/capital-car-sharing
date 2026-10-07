import type { Metadata } from "next";
import { ReservationsList } from "@/components/customer/ReservationsList";

export const metadata: Metadata = { title: "My Reservations" };

export default function ReservationsPage() {
  return <ReservationsList />;
}
