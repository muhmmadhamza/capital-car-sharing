import { apiPartnerAuthRepository } from "./api-repository";
import type { PartnerAuthRepository } from "./repository";

/** Partner authentication, backed by the real API (NEXT_PUBLIC_API_URL). */
export const partnerAuthService: PartnerAuthRepository = apiPartnerAuthRepository;

export type { PartnerAuthRepository } from "./repository";
