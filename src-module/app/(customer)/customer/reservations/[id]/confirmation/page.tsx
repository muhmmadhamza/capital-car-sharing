import type { Metadata } from "next";
import { BookingConfirmation } from "@/components/customer/BookingConfirmation";

export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingConfirmation id={id} />;
}
