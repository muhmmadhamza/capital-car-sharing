import { customerService } from "../api/customer.service";
import { guard, unavailable } from "../errors";
import { mapReservation } from "../mappers/customer";
import type { ReservationsRepository } from "./repository";

export const apiReservationsRepository: ReservationsRepository = {
  async listForCustomer(customerId) {
    const list = (await guard(() => customerService.getReservations())).map(mapReservation);
    return list.filter((r) => r.customerId === customerId);
  },

  async getById(id, customerId) {
    // The API lists a customer's reservations; the one asked for is picked from that list.
    const list = await this.listForCustomer(customerId);
    return list.find((r) => r.id === id) ?? null;
  },

  async cancel() {
    return unavailable("Cancelling a reservation");
  },
};
