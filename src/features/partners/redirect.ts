import { safeNext } from "@/features/auth/redirect";

export const PARTNER_LOGIN_PATH = "/partner/login";
export const PARTNER_REGISTER_PATH = "/partner/register";
export const PARTNER_FORGOT_PATH = "/partner/forgot-password";
export const DEFAULT_AFTER_PARTNER_LOGIN = "/partner/dashboard";

/** Same open-redirect protection as the customer flow, but only inside /partner. */
export function safePartnerNext(value: string | null | undefined): string {
  const next = safeNext(value, DEFAULT_AFTER_PARTNER_LOGIN);
  return next === "/partner" || next.startsWith("/partner/") ? next : DEFAULT_AFTER_PARTNER_LOGIN;
}

export function partnerLoginUrl(params: { next?: string; registered?: string } = {}): string {
  const q = new URLSearchParams();
  if (params.next) q.set("next", params.next);
  if (params.registered) q.set("registered", params.registered);
  const s = q.toString();
  return s ? `${PARTNER_LOGIN_PATH}?${s}` : PARTNER_LOGIN_PATH;
}
