"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { DashboardIcon, ListIcon, LogoutIcon, UserIcon } from "@/components/ui/Icons";
import { formatIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";

const items = [
  { label: "Dashboard", href: "/customer/dashboard", icon: DashboardIcon },
  { label: "My Reservations", href: "/customer/reservations", icon: ListIcon },
  { label: "Profile", href: "/customer/profile", icon: UserIcon },
] as const;

/**
 * Dashboard navigation. A sidebar on large screens; on phones and tablets a
 * horizontally scrollable tab bar so every item stays one tap away.
 */
export function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useAuth();

  async function onLogout() {
    await logout();
    router.push("/");
  }

  const link = (active: boolean) =>
    cn(
      "flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors",
      active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-900/5 hover:text-navy-900",
    );

  const nav: ReactNode = (
    <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
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
  );

  return (
    <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
      {customer ? (
        <div className="mb-4 hidden items-center gap-3 rounded-2xl border border-navy-900/10 bg-white p-4 shadow-card lg:flex">
          <Avatar name={customer.name} src={customer.avatar} className="h-12 w-12 text-base" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900">{customer.name}</p>
            <p className="truncate text-xs text-muted">Member since {formatIsoDate(customer.createdAt)}</p>
          </div>
        </div>
      ) : null}
      <nav aria-label="Customer account" className="rounded-2xl border border-navy-900/10 bg-white p-2 shadow-card">
        {nav}
      </nav>
    </aside>
  );
}
