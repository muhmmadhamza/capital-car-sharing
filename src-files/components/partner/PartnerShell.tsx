"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Container } from "@/components/ui/Container";
import { Footer } from "@/components/layout/Footer";
import { PartnerGuard, usePartnerAuth } from "./PartnerAuthProvider";
import { PartnerNav } from "./PartnerNav";

function PartnerHeader() {
  const { partner } = usePartnerAuth();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <div className="flex items-center gap-3 sm:gap-4">
          <Logo />
          <span className="hidden rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-400 sm:inline-block">
            Partner Portal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-navy-100 transition-colors hover:text-white">
            <span className="hidden sm:inline">Back to site</span>
            <span className="sm:hidden">Site</span>
          </Link>
          {partner ? (
            <Link
              href="/partner/profile"
              aria-label={`${partner.name}, view profile`}
              className="inline-flex h-11 items-center gap-2.5 rounded-md pl-2 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Avatar name={partner.name} src={partner.avatar} className="h-8 w-8 text-xs" />
              <span className="hidden max-w-[8rem] truncate sm:inline">{partner.name.split(" ")[0]}</span>
            </Link>
          ) : null}
        </div>
      </Container>
    </header>
  );
}

/**
 * Everything under /partner (except login, register and forgot-password) sits
 * behind PartnerGuard. New partner pages added to the (portal) group are
 * protected automatically.
 */
export function PartnerShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-950"
      >
        Skip to content
      </a>
      <PartnerHeader />
      <main id="main" className="bg-surface">
        <Container className="py-8 lg:py-12">
          <PartnerGuard>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <PartnerNav />
              <div className="min-w-0">{children}</div>
            </div>
          </PartnerGuard>
        </Container>
      </main>
      <Footer />
    </>
  );
}
