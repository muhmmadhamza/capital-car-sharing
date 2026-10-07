"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/auth";
import type { Customer, LoginInput, ProfileUpdate, RegisterInput } from "@/types/customer";

type Status = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: Status;
  customer: Customer | null;
  /** True right after the customer chose to log out, so guards do not bounce them to the login page. */
  signedOutByUser: boolean;
  login: (input: LoginInput) => Promise<Customer>;
  register: (input: RegisterInput) => Promise<Customer>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<Customer>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/**
 * Single source of truth for "who is signed in". Components only see this
 * context; where the session really lives (mock storage now, an httpOnly
 * cookie checked by the Node.js API later) is hidden inside services/auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [signedOutByUser, setSignedOutByUser] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authService
      .getSession()
      .then((c) => {
        if (cancelled) return;
        setCustomer(c);
        setStatus(c ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setCustomer(null);
        setStatus("unauthenticated");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signedIn = useCallback((c: Customer) => {
    setCustomer(c);
    setStatus("authenticated");
    setSignedOutByUser(false);
    return c;
  }, []);

  const login = useCallback((input: LoginInput) => authService.login(input).then(signedIn), [signedIn]);
  const register = useCallback((input: RegisterInput) => authService.register(input).then(signedIn), [signedIn]);
  const updateProfile = useCallback((input: ProfileUpdate) => authService.updateProfile(input).then(signedIn), [signedIn]);
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setSignedOutByUser(true);
      setCustomer(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ status, customer, signedOutByUser, login, register, logout, updateProfile }),
    [status, customer, signedOutByUser, login, register, logout, updateProfile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
