import { httpPartnerAuthRepository } from "./http-repository";
import { mockPartnerAuthRepository } from "./mock-repository";
import type { PartnerAuthRepository } from "./repository";

/** "mock" (default) or "api". Must be a NEXT_PUBLIC_ variable because it runs in the browser. */
export const partnerAuthService: PartnerAuthRepository =
  process.env.NEXT_PUBLIC_PARTNER_DATA_SOURCE === "api" ? httpPartnerAuthRepository : mockPartnerAuthRepository;

export type { PartnerAuthRepository } from "./repository";
