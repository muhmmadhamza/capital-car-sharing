export const LOGIN_PATH = "/login";
export const REGISTER_PATH = "/register";
export const DEFAULT_AFTER_LOGIN = "/customer/dashboard";

/**
 * Only allow redirects to pages on this site. Rejects absolute URLs and
 * protocol-relative "//evil.com" so `?next=` cannot be used for open redirects.
 */
export function safeNext(value: string | null | undefined, fallback: string = DEFAULT_AFTER_LOGIN): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

/** "/login?next=%2Fcustomer%2Fprofile" */
export function loginUrl(next?: string): string {
  return next ? `${LOGIN_PATH}?next=${encodeURIComponent(next)}` : LOGIN_PATH;
}

export function registerUrl(next?: string): string {
  return next ? `${REGISTER_PATH}?next=${encodeURIComponent(next)}` : REGISTER_PATH;
}
