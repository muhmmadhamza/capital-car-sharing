import { httpAuthRepository } from "./http-repository";
import { mockAuthRepository } from "./mock-repository";
import type { AuthRepository } from "./repository";

/**
 * "mock" (default) or "api". Customer screens run in the browser, so this must
 * be a NEXT_PUBLIC_ variable. Flip it once the backend is live.
 */
export const authService: AuthRepository = process.env.NEXT_PUBLIC_CUSTOMER_DATA_SOURCE === "api" ? httpAuthRepository : mockAuthRepository;

export type { AuthRepository } from "./repository";
