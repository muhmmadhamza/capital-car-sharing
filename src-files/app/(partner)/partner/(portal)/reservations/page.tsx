import type { Metadata } from "next";
import { PartnerReservationsView } from "@/components/partner/PartnerReservationsView";

export const metadata: Metadata = { title: "Partner reservations" };

export default function PartnerReservationsPage() {
  return <PartnerReservationsView />;
}
