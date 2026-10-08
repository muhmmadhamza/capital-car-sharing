import { delay } from "@/lib/browser-storage";
import { ServiceError } from "@/services/errors";
import type { AdminPartnerRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { byNewestPickup, carViews, partnerRows, reservationViews, savePartnerPatch } from "./store";

const rowFor = (id: string) => {
  const row = partnerRows().find((p) => p.id === id);
  if (!row) throw new ServiceError("not_found", "That partner no longer exists.");
  return row;
};

export const mockAdminPartners: AdminPartnerRepository = {
  async getPartners() {
    await delay(350);
    requireMockAdminSession();
    return partnerRows().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getPartnerById(id) {
    await delay(250);
    requireMockAdminSession();
    const row = partnerRows().find((p) => p.id === id);
    if (!row) return null;
    return {
      ...row,
      cars: carViews().filter((c) => c.partnerId === id),
      reservations: reservationViews().filter((r) => r.partnerId === id).sort(byNewestPickup),
    };
  },

  async updatePartnerStatus(id, status) {
    await delay(150);
    requireMockAdminSession();
    savePartnerPatch(id, { status });
    return rowFor(id);
  },
};
