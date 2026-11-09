"use client";

import Link from "next/link";
import { loginUrl, registerUrl } from "@/features/auth/redirect";
import { Button } from "@/components/ui/Button";
import { useAuth } from "./AuthProvider";

/**
 * Shown on the reserve step. Anonymous visitors are invited to log in or
 * register and come straight back to these exact dates; signed-in customers
 * get a link to their dashboard. Booking itself arrives in the next module.
 */
export function ReserveAuthPrompt({ returnTo }: { returnTo: string }) {
  const { status, customer } = useAuth();
  if (status === "loading") return null;

  if (status === "authenticated" && customer) {
    return (
      <p className="mt-4 text-sm text-navy-700">
        Signed in as <span className="font-semibold text-navy-900">{customer.name}</span>.{" "}
        <Link href="/customer/dashboard" className="font-semibold text-navy-900 underline underline-offset-2 hover:text-gold-700">
          Go to your dashboard
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-navy-900/10 bg-surface p-4">
      <p className="text-sm font-semibold text-navy-900">Log in to reserve this car</p>
      <p className="mt-1 text-sm text-muted">Your dates are saved. Sign in or create an account and you will come straight back here.</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Button href={loginUrl(returnTo)} variant="navy">
          Log in
        </Button>
        <Button href={registerUrl(returnTo)} variant="outline-navy">
          Create Account
        </Button>
      </div>
    </div>
  );
}
