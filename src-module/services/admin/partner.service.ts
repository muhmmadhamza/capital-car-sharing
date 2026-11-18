import { apiAdminPartners } from "./api-repository";
import type { AdminPartnerRepository } from "./contracts";

const repo: AdminPartnerRepository = apiAdminPartners;

export const getPartners: AdminPartnerRepository["getPartners"] = () => repo.getPartners();
export const getPartnerById: AdminPartnerRepository["getPartnerById"] = (id) => repo.getPartnerById(id);
export const updatePartnerStatus: AdminPartnerRepository["updatePartnerStatus"] = (id, status) => repo.updatePartnerStatus(id, status);
