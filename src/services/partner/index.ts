import { httpPartnerDataRepository } from "./http-repository";
import { mockPartnerDataRepository } from "./mock-repository";
import type { PartnerDataRepository } from "./repository";

/**
 * The single entry point screens use for partner data. "mock" (default) or
 * "api" via NEXT_PUBLIC_PARTNER_DATA_SOURCE.
 */
export const partnerData: PartnerDataRepository =
  process.env.NEXT_PUBLIC_PARTNER_DATA_SOURCE === "api" ? httpPartnerDataRepository : mockPartnerDataRepository;

export type { PartnerDataRepository } from "./repository";
