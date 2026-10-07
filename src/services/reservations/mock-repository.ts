import { getSeedReservations } from "@/data/mock/reservations";
import { delay, readJson, writeJson } from "@/lib/browser-storage";
import type { Reservation } from "@/types/reservation";
import { ServiceError } from "../errors";
import type { ReservationsRepository } from "./repository";

/**
 * Seeds come from src/data/mock. The only thing persisted is a map of
 * cancellations (id -> ISO time), so reloading keeps a cancelled reservation
 * cancelled while the seeds themselves stay relative to today.
 */
const CANCELLED_KEY = "ccs.mock.cancelled";

const readCancelled = () => readJson<Record<string, string>>(CANCELLED_KEY, {});

function load(): Reservation[] {
  const cancelled = readCancelled();
  return getSeedReservations().map((r) => (cancelled[r.id] ? { ...r, status: "cancelled", cancelledAt: cancelled[r.id] } : r));
}

export const mockReservationsRepository: ReservationsRepository = {
  async listForCustomer(customerId) {
    await delay();
    return load().filter((r) => r.customerId === customerId);
  },

  async getById(id, customerId) {
    await delay(150);
    return load().find((r) => r.id === id && r.customerId === customerId) ?? null;
  },

  async cancel(id, customerId) {
    await delay();
    const reservation = load().find((r) => r.id === id && r.customerId === customerId);
    if (!reservation) throw new ServiceError("not_found", "We could not find that reservation.");
    if (reservation.status !== "upcoming") {
      throw new ServiceError("not_cancellable", "Only upcoming reservations can be cancelled.");
    }
    const cancelledAt = new Date().toISOString();
    writeJson(CANCELLED_KEY, { ...readCancelled(), [id]: cancelledAt });
    return { ...reservation, status: "cancelled", cancelledAt };
  },
};
