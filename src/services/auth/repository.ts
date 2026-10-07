import type { Customer, LoginInput, ProfileUpdate, RegisterInput } from "@/types/customer";

/**
 * Data-access contract for customer authentication. The UI only talks to
 * src/services/auth, so replacing the mock with the Node.js + PostgreSQL API
 * is one new repository, not a UI rewrite.
 *
 * Planned API, all under /api/v1. The session lives in an httpOnly cookie set
 * by the server, so the browser never handles a token:
 *   POST  /auth/register         { name, email, phone, password }   -> Customer   (409 email_taken)
 *   POST  /auth/login            { email, password, remember }      -> Customer   (401 invalid_credentials)
 *   POST  /auth/logout                                              -> 204
 *   GET   /customers/me                                             -> Customer | 401
 *   PATCH /customers/me          { name, email, phone, avatar? }    -> Customer   (409 email_taken)
 *   POST  /customers/me/avatar   multipart image                    -> { url }
 *
 * Errors are `{ code, message, field? }` and become ServiceError (../errors).
 * Passwords are hashed (argon2 or bcrypt) in PostgreSQL; never stored or logged in clear text.
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
