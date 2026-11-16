"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { loginUrl } from "@/features/auth/redirect";
import { useAuth } from "./AuthProvider";

/**
 * Client-side route protection for the customer area: anonymous visitors are
 * sent to /login and returned to the page they wanted afterwards. Nothing
 * private renders until the session is confirmed.
 *
 * This is for experience only. The Node.js API must also reject unauthenticated
 * requests, because anything in the browser can be bypassed.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { status, signedOutByUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // After an explicit logout the caller is already navigating home; do not race it to /login.
    if (status === "unauthenticated" && !signedOutByUser) router.replace(loginUrl(pathname));
  }, [status, signedOutByUser, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[50vh] items-center justify-center">
        <span className="sr-only">{status === "loading" ? "Checking your session" : "Redirecting to sign in"}</span>
        <span aria-hidden="true" className="h-9 w-9 animate-spin rounded-full border-[3px] border-navy-900/15 border-t-gold-500" />
      </div>
    );
  }
  return <>{children}</>;
}

/** For login/register: signed-in customers go straight to their destination. */
export function useRedirectIfAuthenticated(to: string) {
  const { status } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace(to);
  }, [status, router, to]);
  return status;
}
