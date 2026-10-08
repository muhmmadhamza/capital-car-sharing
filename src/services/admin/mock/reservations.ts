import { delay } from "@/lib/browser-storage";
import type { AdminReservationRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { byNewestPickup, reservationDetail, reservationViews } from "./store";

export const mockAdminReservations: AdminReservationRepository = {
  async getReservations() {
    await delay(350);
    requireMockAdminSession();
    return reservationViews().sort(byNewestPickup);
  },

  async getReservationById(id) {
    await delay(250);
    requireMockAdminSession();
    return reservationDetail(id);
  },
};
