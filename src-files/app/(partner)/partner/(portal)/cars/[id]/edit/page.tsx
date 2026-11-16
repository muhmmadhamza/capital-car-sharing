import type { Metadata } from "next";
import { EditCarView } from "@/components/partner/EditCarView";

export const metadata: Metadata = { title: "Edit car" };

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditCarView id={id} />;
}
