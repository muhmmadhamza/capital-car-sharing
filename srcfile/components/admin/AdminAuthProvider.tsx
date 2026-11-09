"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { adminLoginUrl } from "@/features/admin/redirect";
import { getAdmin, loginAdmin, logoutAdmin } from "@/services/admin/admin.service";
import type { Admin, AdminLoginInput } from "@/types/admin";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AdminAuthState {
  status: Status;
  admin: Admin | null;
  /** True right after the admin chose to log out, so the guard does not bounce them to login with ?next=. */
  signedOutByUser: boolean;
  login: (input: AdminLoginInput) => Promise<Admin>;
  logout: () => Promise<void>;
  /** Forget that the admin just logged out (the guard calls this when it unmounts). */
  clearSignedOut: () => void;
}

const Ctx = createContext<AdminAuthState | null>(null);

export function useAdminAuth(): AdminAuthState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return value;
}

/**
 * Single source of truth for "which admin is signed in". It is separate from
 * the customer AuthProvider (root layout) and the PartnerAuthProvider on
 * purpose: a customer or partner session never counts as an admin session.
 * Mounted only under /admin.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [signedOutByUser, setSignedOutByUser] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdmin()
      .then((a) => {
        if (cancelled) return;
        setAdmin(a);
        setStatus(a ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setAdmin(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: AdminLoginInput) => {
    const a = await loginAdmin(input);
    setAdmin(a);
    setStatus("authenticated");
    setSignedOutByUser(false);
    return a;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      setSignedOutByUser(true);
      setAdmin(null);
      setStatus("unauthenticated");
    }
  }, []);

  const clearSignedOut = useCallback(() => setSignedOutByUser(false), []);

  const value = useMemo<AdminAuthState>(
    () => ({ status, admin, signedOutByUser, login, logout, clearSignedOut }),
    [status, admin, signedOutByUser, login, logout, clearSignedOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function FullPageSpinner({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] items-center justify-center">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="h-9 w-9 animate-spin rounded-full border-[3px] border-navy-900/15 border-t-gold-500" />
    </div>
  );
}

/**
 * Reusable route guard for every admin page except login and forgot-password.
 * Client-side protection only, for experience: the Node.js API must also
 * reject requests without an admin session. Children never render until a
 * session is confirmed, so protected content does not flash for visitors.
 */
export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { status, signedOutByUser, clearSignedOut } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Leaving the admin area after a logout ends the "just logged out" state, so opening an
  // admin page later is sent to the login page as usual.
  useEffect(() => clearSignedOut, [clearSignedOut]);

  useEffect(() => {
    if (status === "unauthenticated" && !signedOutByUser) router.replace(adminLoginUrl(pathname));
  }, [status, signedOutByUser, router, pathname]);

  if (status !== "authenticated") {
    return <FullPageSpinner label={status === "loading" ? "Checking your session" : "Redirecting to sign in"} />;
  }
  return <>{children}</>;
}

/** For the login page: a signed-in admin goes straight to their destination. */
export function useAdminRedirectIfAuthenticated(to: string): Status {
  const { status } = useAdminAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated") router.replace(to);
  }, [status, router, to]);
  return status;
}
