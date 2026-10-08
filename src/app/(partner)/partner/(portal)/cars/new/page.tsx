import type { Metadata } from "next";
import { CarForm } from "@/components/partner/CarForm";

export const metadata: Metadata = { title: "Add car" };

export default function AddCarPage() {
  return <CarForm mode="add" />;
}
