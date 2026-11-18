import type { Metadata } from "next";
import { CustomerDetailsView } from "@/components/admin/customers/CustomerDetailsView";

export const metadata: Metadata = { title: "Customer details" };

export default async function AdminCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailsView id={id} />;
}
