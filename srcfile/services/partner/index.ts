import { apiPartnerDataRepository } from "./api-repository";
import type { PartnerDataRepository } from "./repository";

/** The single entry point screens use for partner data, backed by the real API. */
export const partnerData: PartnerDataRepository = apiPartnerDataRepository;

export type { PartnerDataRepository } from "./repository";
