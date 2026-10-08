import { httpAdminPartners } from "./http";
import { mockAdminPartners } from "./mock/partners";
import { isAdminApi } from "./source";
import type { AdminPartnerRepository } from "./contracts";

const repo: AdminPartnerRepository = isAdminApi ? httpAdminPartners : mockAdminPartners;

export const getPartners: AdminPartnerRepository["getPartners"] = () => repo.getPartners();
export const getPartnerById: AdminPartnerRepository["getPartnerById"] = (id) => repo.getPartnerById(id);
export const updatePartnerStatus: AdminPartnerRepository["updatePartnerStatus"] = (id, status) => repo.updatePartnerStatus(id, status);
