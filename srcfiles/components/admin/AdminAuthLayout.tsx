import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { ShieldCheckIcon } from "./AdminIcons";

/** Split-screen frame for admin login and forgot-password: navy brand panel, white form. No public site header. */
export function AdminAuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-navy-950 px-6 py-6 text-white sm:px-10 lg:px-14 lg:py-12">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Capital Car Sharing home">
          <LogoMark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight">Capital</span>
            <span className="mt-1 text-xs font-medium tracking-wide text-gold-400">Car Sharing</span>
          </span>
        </Link>
        <div className="hidden lg:block">
          <span aria-hidden="true" className="mb-6 block h-1 w-12 rounded-full bg-gold-500" />
          <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Run the platform
            <br />
            with confidence.
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-navy-200">
            Manage customers, partners, cars and reservations from one place.
          </p>
        </div>
        <p className="hidden items-center gap-2 text-sm text-navy-300 lg:flex">
          <ShieldCheckIcon width={18} height={18} className="text-gold-400" />
          Authorised staff only
        </p>
      </aside>

      <main className="flex items-center justify-center bg-white px-5 py-10 sm:px-8 lg:py-12">
        <div className="w-full max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-700/30 bg-gold-500/15 px-3 py-1 text-xs font-semibold tracking-wide text-navy-900">
            <ShieldCheckIcon width={14} height={14} className="text-gold-700" />
            Admin Console
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm text-navy-700">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
