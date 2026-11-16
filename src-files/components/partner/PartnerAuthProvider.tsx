"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { partnerLoginUrl } from "@/features/partners/redirect";
import { partnerAuthService } from "@/services/partner-auth";
import type { Partner, PartnerLoginInput, PartnerProfileUpdate } from "@/types/partner";

type Status = "loading" | "authenticated" | "unauthenticated";

interface PartnerAuthState {
  status: Status;
  partner: Partner | null;
  /** True right after the partner chose to log out, so the guard does not bounce them to login. */
  signedOutByUser: boolean;
  login: (input: PartnerLoginInput) => Promise<Partner>;
  logout: () => Promise<void>;
  /** Forget that the partner just logged out (the guard calls this when it unmounts). */
  clearSignedOut: () => void;
  updateProfile: (input: PartnerProfileUpdate) => Promise<Partner>;
}

const Ctx = createContext<PartnerAuthState | null>(null);

export function usePartnerAuth(): PartnerAuthState {
  const value = useContext(Ctx);
  if (!value) throw new Error("usePartnerAuth must be used inside <PartnerAuthProvider>");
  return value;
}

/**
 * Single source of truth for "which partner is signed in". It is separate from
 * the customer AuthProvider on purpose: a customer session never counts as a
 * partner session. Mounted only under /partner.
 */
export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [signedOutByUser, setSignedOutByUser] = useState(false);

  useEffect(() => {
    let cancelled = false;
    partnerAuthService
      .getSession()
      .then((p) => {
        if (cancelled) return;
        setPartner(p);
        setStatus(p ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setPartner(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = useCallback((p: Partner) => {
    setPartner(p);
    setStatus("authenticated");
    setSignedOutByUser(false);
    return p;
  }, []);

  const login = useCallback((input: PartnerLoginInput) => partnerAuthService.login(input).then(signedIn), [signedIn]);
  const updateProfile = useCallback((input: PartnerProfileUpdate) => partnerAuthService.updateProfile(input).then(signedIn), [signedIn]);
  const logout = useCallback(async () => {
    try {
      await partnerAuthService.logout();
    } finally {
      setSignedOutByUser(true);
      setPartner(null);
      setStatus("unauthenticated");
    }
  }, []);

  const clearSignedOut = useCallback(() => setSignedOutByUser(false), []);

  const value = useMemo<PartnerAuthState>(
    () => ({ status, partner, signedOutByUser, login, logout, clearSignedOut, updateProfile }),
    [status, partner, signedOutByUser, login, logout, clearSignedOut, updateProfile],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Client-side route protection for the partner portal. For experience only:
 * the Node.js API must also reject requests without a partner session.
 */
export function PartnerGuard({ children }: { children: ReactNode }) {
  const { status, signedOutByUser, clearSignedOut } = usePartnerAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Leaving the portal after a logout ends the "just logged out" state, so opening a
  // partner page later is sent to the login page as usual.
  useEffect(() => clearSignedOut, [clearSignedOut]);

  useEffect(() => {
    if (status === "unauthenticated" && !signedOutByUser) router.replace(partnerLoginUrl({ next: pathname }));
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

/** For login: signed-in partners go straight to their destination. */
export function usePartnerRedirectIfAuthenticated(to: string) {
  const { status } = usePartnerAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace(to);
  }, [status, router, to]);
  return status;
}
