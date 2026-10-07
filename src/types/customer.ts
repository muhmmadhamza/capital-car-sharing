/**
 * A customer account. Matches the `customers` table (password hash and other
 * server-only columns are never sent to the browser).
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Image URL (or data URL in mock mode). Empty or missing shows initials. */
  avatar?: string;
  /** ISO 8601 timestamp, e.g. "2026-10-08T01:27:00.000Z". */
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
  /** Keep the session after the browser closes. */
  remember: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/** Fields a customer can change on their profile. */
export interface ProfileUpdate {
  name: string;
  email: string;
  phone: string;
  /** `null` removes the avatar. `undefined` leaves it unchanged. */
  avatar?: string | null;
}
