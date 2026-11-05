import { apiAuthRepository } from "./api-repository";
import type { AuthRepository } from "./repository";

/** Customer authentication, backed by the real API (NEXT_PUBLIC_API_URL). */
export const authService: AuthRepository = apiAuthRepository;

export type { AuthRepository } from "./repository";
