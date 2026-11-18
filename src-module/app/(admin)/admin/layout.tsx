import type { Metadata } from "next";
import { AdminAuthProvider } from "@/components/admin/AdminAuthProvider";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin | Capital Car Sharing" },
  robots: { index: false, follow: false },
};

/**
 * The whole admin area has its own auth provider, separate from the customer
 * one in the root layout and the partner one under /partner. A customer or
 * partner session never counts as an admin session.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}
