import type { Partner, PartnerLoginInput, PartnerProfileUpdate, PartnerRegisterInput } from "@/types/partner";

/**
 * Data-access contract for PARTNER authentication. It is separate from
 * src/services/auth (customers): a customer or admin session is never treated
 * as a partner session. The implementation (./api-repository.ts) uses:
 *   POST /auth/register (role "partner")   POST /auth/login   POST /auth/logout
 *   GET  /partners/me                      PUT  /partners/me
 *
 * Not offered by the backend yet (these report "unavailable", never a fake success):
 *   - uploading a profile photo
 *   - changing the email address
 *   - password reset by email
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
