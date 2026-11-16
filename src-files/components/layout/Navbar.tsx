"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { mainNav } from "@/config/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

const authLink =
  "inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-navy-100 transition-colors hover:text-white";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { status, customer, logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    setOpen(false);
    await logout();
    router.push("/");
  }

  const firstName = customer?.name.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur supports-[backdrop-filter]:bg-navy-900/85">
      <Container className="flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-navy-100 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop account area. Reserves its space while the session loads so the header does not jump. */}
          <div className="hidden min-h-11 items-center gap-1 lg:flex" aria-live="polite">
            {status === "authenticated" && customer ? (
              <>
                <Link href="/customer/dashboard" className={authLink}>
                  Dashboard
                </Link>
                <Link
                  href="/customer/profile"
                  className="inline-flex h-11 items-center gap-2.5 rounded-md pl-2 pr-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  aria-label={`${customer.name}, view profile`}
                >
                  <Avatar name={customer.name} src={customer.avatar} className="h-8 w-8 text-xs" />
                  <span className="max-w-[8rem] truncate">{firstName}</span>
                </Link>
                <button type="button" onClick={onLogout} className={authLink}>
                  Logout
                </button>
              </>
            ) : status === "unauthenticated" ? (
              <>
                <Link href="/login" className={authLink}>
                  Login
                </Link>
                <Button href="/register">Create Account</Button>
              </>
            ) : null}
          </div>

          {/* Mobile: avatar shortcut to the dashboard when signed in, plus the menu button. */}
          {status === "authenticated" && customer ? (
            <Link href="/customer/dashboard" aria-label="Dashboard" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 lg:hidden">
              <Avatar name={customer.name} src={customer.avatar} className="h-8 w-8 text-xs" />
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-menu" className="border-t border-white/10 bg-navy-900 lg:hidden">
          <Container className="py-4">
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {mainNav.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block border-b border-white/10 py-3.5 text-base font-medium text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {status === "authenticated" && customer ? (
              <div className="mt-5">
                <div className="mb-4 flex items-center gap-3">
                  <Avatar name={customer.name} src={customer.avatar} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{customer.name}</p>
                    <p className="truncate text-sm text-navy-200">{customer.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button href="/customer/dashboard" size="lg" className="w-full" onClick={() => setOpen(false)}>
                    Dashboard
                  </Button>
                  <Button variant="outline-light" size="lg" className="w-full" onClick={onLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            ) : status === "unauthenticated" ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button href="/login" variant="outline-light" size="lg" className="w-full" onClick={() => setOpen(false)}>
                  Login
                </Button>
                <Button href="/register" size="lg" className="w-full" onClick={() => setOpen(false)}>
                  Create Account
                </Button>
              </div>
            ) : null}
          </Container>
        </div>
      ) : null}
    </header>
  );
}
