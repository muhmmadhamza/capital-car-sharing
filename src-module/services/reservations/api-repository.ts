import { customerService } from "../api/customer.service";
import { guard, isServiceError, ServiceError } from "../errors";
import { mapReservation } from "../mappers/customer";
import { numericId } from "../mappers/common";
import type { ReservationsRepository } from "./repository";

export const apiReservationsRepository: ReservationsRepository = {
  async listForCustomer(customerId) {
    const list = (await guard(() => customerService.getReservations())).map(mapReservation);
    return list.filter((r) => r.customerId === customerId);
  },

  async getById(id, customerId) {
    const numeric = numericId(id);
    if (numeric === null) return null;
    try {
      const reservation = mapReservation(await guard(() => customerService.getReservation(numeric)));
      return reservation.customerId === customerId ? reservation : null;
    } catch (e) {
      // The API answers 404 for a reservation that does not exist or belongs to someone else.
      if (isServiceError(e) && e.code === "not_found") return null;
      throw e;
    }
  },

  quote: (input) => guard(() => customerService.quoteReservation(input)),

  async create(input) {
    return mapReservation(await guard(() => customerService.createReservation(input)));
  },

  async cancel(id, customerId, reason) {
    const numeric = numericId(id);
    if (numeric === null) throw new ServiceError("not_found", "We could not find that reservation.");
    const reservation = mapReservation(await guard(() => customerService.cancelReservation(numeric, reason)));
    // The API only cancels the signed-in customer's own booking (404 otherwise); this is a second, cheap check.
    if (reservation.customerId !== customerId) throw new ServiceError("not_found", "We could not find that reservation.");
    return reservation;
  },
};
