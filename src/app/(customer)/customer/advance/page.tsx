import type { Metadata } from "next";
import { AdvanceReservation } from "@/components/customer/AdvanceReservation";

export const metadata: Metadata = { title: "Reserve Ahead" };

export default function AdvanceReservationPage() {
  return <AdvanceReservation />;
}
