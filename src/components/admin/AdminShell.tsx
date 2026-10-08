"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { CarIcon, CloseIcon, DashboardIcon, ListIcon, LogoutIcon, MenuIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { ADMIN_LOGIN_PATH } from "@/features/admin/redirect";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/types/admin";
import { AdminRouteGuard, useAdminAuth } from "./AdminAuthProvider";
import { BuildingIcon, SettingsIcon, UsersIcon } from "./AdminIcons";
import { AdminToastProvider } from "./ui";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

interface NavEntry {
  label: string;
  href: string;
  icon: IconType;
  match: (path: string) => boolean;
  /** Page exists as a placeholder until a later part of the admin module. */
  soon?: boolean;
}

const startsWith = (base: string) => (p: string) => p === base || p.startsWith(`${base}/`);

const NAV: NavEntry[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon, match: (p) => p === "/admin" },
  { label: "Customers", href: "/admin/customers", icon: UsersIcon, match: startsWith("/admin/customers") },
  { label: "Partners", href: "/admin/partners", icon: BuildingIcon, match: startsWith("/admin/partners") },
  { label: "Cars", href: "/admin/cars", icon: CarIcon, match: startsWith("/admin/cars") },
  { label: "Reservations", href: "/admin/reservations", icon: ListIcon, match: startsWith("/admin/reservations") },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon, match: startsWith("/admin/settings") },
];

const ROLE_LABELS: Record<AdminRole, string> = { super_admin: "Super admin", admin: "Admin", support: "Support" };

function Brand() {
  return (
    <Link href="/admin" className="inline-flex items-center gap-3" aria-label={`${siteConfig.name} admin home`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight text-white">Capital</span>
        <span className="mt-1 text-xs font-medium tracking-wide text-gold-400">Admin Console</span>
      </span>
    </Link>
  );
}

/** Shared by the desktop sidebar and the mobile drawer. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  async function onLogout() {
    onNavigate?.();
    await logout();
    router.replace(ADMIN_LOGIN_PATH);
  }

  const item = "relative flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
        <Brand />
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-5">
        <ul className="space-y-1">
          {NAV.map(({ label, href, icon: Icon, match, soon }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(item, active ? "bg-white/10 text-white" : "text-navy-200 hover:bg-white/5 hover:text-white")}
                >
                  {active ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-full bg-gold-500" /> : null}
                  <Icon width={19} height={19} className={active ? "text-gold-400" : "text-navy-300"} />
                  <span className="flex-1">{label}</span>
                  {soon ? (
                    <span className="rounded-full border border-gold-500/40 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-gold-400">Soon</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        {admin ? (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={admin.name} className="h-9 w-9 text-xs" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
              <p className="truncate text-xs text-navy-300">{ROLE_LABELS[admin.role]}</p>
            </div>
          </div>
        ) : null}
        <button type="button" onClick={onLogout} className={cn(item, "text-navy-200 hover:bg-white/5 hover:text-white")}>
          <LogoutIcon width={19} height={19} className="text-navy-300" />
          Logout
        </button>
      </div>
    </div>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-navy-950/60" onClick={onClose} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Admin menu" className="relative h-full w-72 max-w-[85vw] bg-navy-950 shadow-card">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-2 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-200 hover:bg-white/10 hover:text-white"
        >
          <CloseIcon width={20} height={20} />
        </button>
        <SidebarContent onNavigate={onClose} />
      </div>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { admin } = useAdminAuth();
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-navy-900/10 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-navy-900 hover:bg-navy-900/5 lg:hidden"
        >
          <MenuIcon width={22} height={22} />
        </button>
        <span className="font-display text-base font-semibold text-navy-900 lg:hidden">Admin</span>
        <span className="hidden rounded-full border border-gold-700/30 bg-gold-500/15 px-3 py-1 text-xs font-semibold tracking-wide text-navy-900 lg:inline-block">
          Admin Console
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Link href="/" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
          <span className="hidden sm:inline">View public site</span>
          <span className="sm:hidden">Site</span>
        </Link>
        {admin ? (
          <div className="flex items-center gap-2.5 pl-2">
            <Avatar name={admin.name} className="h-9 w-9 text-xs" />
            <div className="hidden min-w-0 leading-tight md:block">
              <p className="truncate text-sm font-semibold text-navy-900">{admin.name}</p>
              <p className="truncate text-xs text-muted">{ROLE_LABELS[admin.role]}</p>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

/**
 * Layout for every admin page behind the guard: sidebar on large screens, a
 * drawer on tablets and phones. New admin pages added to the (portal) route
 * group are protected and wrapped automatically.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-950"
      >
        Skip to content
      </a>
      <AdminRouteGuard>
        <AdminToastProvider>
          <div className="min-h-dvh bg-surface lg:pl-64">
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 bg-navy-950 lg:block">
              <SidebarContent />
            </aside>
            {drawer ? <MobileDrawer onClose={() => setDrawer(false)} /> : null}
            <TopBar onMenu={() => setDrawer(true)} />
            <main id="main" className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </AdminToastProvider>
      </AdminRouteGuard>
    </>
  );
}
