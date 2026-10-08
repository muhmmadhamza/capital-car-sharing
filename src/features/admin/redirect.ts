import { safeNext } from "@/features/auth/redirect";

export const ADMIN_HOME = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_FORGOT_PATH = "/admin/forgot-password";

/** Same open-redirect protection as the other areas, but only inside /admin (and never back to the login page). */
export function safeAdminNext(value: string | null | undefined): string {
  const next = safeNext(value, ADMIN_HOME);
  const insideAdmin = next === ADMIN_HOME || next.startsWith("/admin/") || next.startsWith("/admin?");
  const isAuthPage = next === ADMIN_LOGIN_PATH || next.startsWith("/admin/login") || next.startsWith(ADMIN_FORGOT_PATH);
  return insideAdmin && !isAuthPage ? next : ADMIN_HOME;
}

export function adminLoginUrl(next?: string): string {
  return next && next !== ADMIN_HOME ? `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}` : ADMIN_LOGIN_PATH;
}
