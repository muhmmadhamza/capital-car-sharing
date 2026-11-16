import type { Metadata } from "next";
import { VerificationsView } from "@/components/admin/verifications/VerificationsView";

export const metadata: Metadata = { title: "Verifications" };

export default function AdminVerificationsPage() {
  return <VerificationsView />;
}
