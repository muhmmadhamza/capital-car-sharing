import { AdminShell } from "@/components/admin/AdminShell";

/** Every page in this group is behind the admin guard. Add new admin pages here. */
export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
