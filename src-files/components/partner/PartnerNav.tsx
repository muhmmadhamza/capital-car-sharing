"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { CalendarIcon, CarIcon, DashboardIcon, ListIcon, LogoutIcon, PlusIcon, UserIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";
import { usePartnerAuth } from "./PartnerAuthProvider";

const items = [
  { label: "Overview", href: "/partner/dashboard", icon: DashboardIcon, match: (p: string) => p === "/partner/dashboard" },
  { label: "My Cars", href: "/partner/cars", icon: CarIcon, match: (p: string) => p === "/partner/cars" || (p.startsWith("/partner/cars/") && p !== "/partner/cars/new") },
  { label: "Add Car", href: "/partner/cars/new", icon: PlusIcon, match: (p: string) => p === "/partner/cars/new" },
  { label: "Availability", href: "/partner/availability", icon: CalendarIcon, match: (p: string) => p.startsWith("/partner/availability") },
  { label: "Reservations", href: "/partner/reservations", icon: ListIcon, match: (p: string) => p.startsWith("/partner/reservations") },
  { label: "Profile", href: "/partner/profile", icon: UserIcon, match: (p: string) => p.startsWith("/partner/profile") },
] as const;

/** Sidebar on large screens, a scrollable tab bar on phones and tablets. */
export function PartnerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { partner, logout } = usePartnerAuth();

  async function onLogout() {
    await logout();
    router.push("/partner/login");
  }

  const link = (active: boolean) =>
    cn(
      "flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors",
      active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-900/5 hover:text-navy-900",
    );

  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      {partner ? (
        <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card lg:flex">
          <Avatar name={partner.name} src={partner.avatar} className="h-12 w-12 text-base" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900">{partner.companyName || partner.name}</p>
            <p className="truncate text-xs text-muted">{partner.companyName ? partner.name : "Private owner"}</p>
          </div>
        </div>
      ) : null}
      <nav aria-label="Partner dashboard" className="rounded-2xl border border-navy-900/10 bg-white p-2 shadow-card">
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {items.map(({ label, href, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <li key={href} className="shrink-0 lg:shrink">
                <Link href={href} className={link(active)} aria-current={active ? "page" : undefined}>
                  <Icon width={18} height={18} className={active ? "text-gold-400" : "text-gold-700"} />
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0 lg:mt-2 lg:border-t lg:border-navy-900/10 lg:pt-2">
            <button type="button" onClick={onLogout} className={cn(link(false), "w-full")}>
              <LogoutIcon width={18} height={18} className="text-gold-700" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
