import type { Partner, PartnerLoginInput, PartnerProfileUpdate, PartnerRegisterInput } from "@/types/partner";

/**
 * Data-access contract for PARTNER authentication. It is deliberately separate
 * from src/services/auth (customers): different accounts, different session,
 * different endpoints. Swapping the mock for the Node.js + PostgreSQL API is
 * one new repository, not a UI rewrite.
 *
 * Planned API, all under /api/v1, session in an httpOnly cookie:
 *   POST  /partner/auth/register   { name, companyName?, email, phone, password, address } -> Partner  (409 email_taken)
 *   POST  /partner/auth/login      { email, password, remember }                           -> Partner  (401 invalid_credentials)
 *   POST  /partner/auth/logout                                                             -> 204
 *   GET   /partners/me                                                                     -> Partner | 401
 *   PATCH /partners/me             { name, companyName, email, phone, address, avatar? }   -> Partner  (409 email_taken)
 *   POST  /partners/me/avatar      multipart image                                         -> { url }
 *
 * Passwords are hashed in PostgreSQL. The API must reject a customer session on
 * every /partner route and the other way round.
 */
export interface PartnerAuthRepository {
  getSession(): Promise<Partner | null>;
  /** Creates the account. It does NOT sign the partner in; they log in next. */
  register(input: PartnerRegisterInput): Promise<Partner>;
  login(input: PartnerLoginInput): Promise<Partner>;
  logout(): Promise<void>;
  updateProfile(input: PartnerProfileUpdate): Promise<Partner>;
  uploadAvatar(file: File): Promise<string>;
}
