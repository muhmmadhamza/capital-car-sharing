import { PartnerShell } from "@/components/partner/PartnerShell";

/** Every page in this group is behind the partner guard. Add new partner pages here. */
export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PartnerShell>{children}</PartnerShell>;
}
