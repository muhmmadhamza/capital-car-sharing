"use client";

import Link from "next/link";
import { useState } from "react";
import { mainNav } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

export function Navbar() {
  const [open, setOpen] = useState(false);

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

        <div className="flex items-center gap-3">
          <Button href="/cars" className="hidden sm:inline-flex">
            Book a Car
          </Button>
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
            <Button href="/cars" size="lg" className="mt-5 w-full" onClick={() => setOpen(false)}>
              Book a Car
            </Button>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
