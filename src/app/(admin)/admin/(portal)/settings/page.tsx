import type { Metadata } from "next";
import { SettingsView } from "@/components/admin/settings/SettingsView";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return <SettingsView />;
}
