import type { Metadata } from "next";
import { PartnerAuthProvider } from "@/components/partner/PartnerAuthProvider";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * The whole partner area has its own auth provider, separate from the customer
 * one in the root layout. A customer session never counts as a partner session.
 */
export default function PartnerRootLayout({ children }: { children: React.ReactNode }) {
  return <PartnerAuthProvider>{children}</PartnerAuthProvider>;
}
