/**
 * Account roles. Each role has its own account type, its own session and its
 * own area of the site, so a customer session can never open the partner
 * dashboard and the other way round.
 *
 *   customer -> /customer/*   (src/services/auth,         src/components/auth)
 *   partner  -> /partner/*    (src/services/partner-auth,  src/components/partner)
 *   admin    -> /admin/*      (src/services/admin,         src/components/admin)
 *
 * Future backend: one `users` table with a `role` column (or one table per
 * role), one login endpoint per area, and a role claim checked by the API on
 * every request. The client then redirects to ROLE_HOME[role] after login.
 */
export type UserRole = "customer" | "partner" | "admin";

export const ROLE_HOME: Record<UserRole, string> = {
  customer: "/customer/dashboard",
  partner: "/partner/dashboard",
  admin: "/admin",
};

export const ROLE_LOGIN: Record<UserRole, string> = {
  customer: "/login",
  partner: "/partner/login",
  admin: "/admin/login",
};
