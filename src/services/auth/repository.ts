import type { Customer, LoginInput, ProfileUpdate, RegisterInput } from "@/types/customer";

/**
 * Data-access contract for customer authentication. The UI only talks to
 * src/services/auth; the implementation (./api-repository.ts) uses the API
 * endpoints in src/services/api:
 *   POST /auth/customer/register   POST /auth/customer/login   GET /auth/me   POST /auth/logout
 *   PUT  /customers/me
 *
 * The session is the token the API issues at login. A session that belongs to
 * a partner or an admin is never treated as a customer session.
 *
 * Not offered by the backend yet (these report "unavailable", never a fake success):
 *   - uploading a profile photo
 *   - changing the email address
 *   - password reset by email
 */
export interface AuthRepository {
  /** The signed-in customer, or null when nobody is signed in. */
  getSession(): Promise<Customer | null>;
  register(input: RegisterInput): Promise<Customer>;
  login(input: LoginInput): Promise<Customer>;
  logout(): Promise<void>;
  updateProfile(input: ProfileUpdate): Promise<Customer>;
  /** Uploads an image and returns the URL to store as `avatar`. */
  uploadAvatar(file: File): Promise<string>;
}
