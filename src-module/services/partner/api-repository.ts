import { addDays, addMonths, daysInMonth, dateOf, nowWall } from "@/lib/date";
import type { CarInput } from "@/types/api";
import type { Availability, CarDayStatus, PartnerCarStatus } from "@/types/partner";
import { partnerService } from "../api/partner.service";
import { guard, isServiceError, ServiceError } from "../errors";
import { numericId, toDateKey } from "../mappers/common";
import { mapPartnerCar, mapPartnerReservation, toApiCarInput } from "../mappers/partner";
import type { PartnerDataRepository } from "./repository";

const toApiStatus = (s?: PartnerCarStatus): CarInput["status"] => (s === "available" ? "active" : s === "unavailable" ? "inactive" : undefined);

function requireId(id: string): number {
  const n = numericId(id);
  if (n === null) throw new ServiceError("not_found", "We could not find that car.");
  return n;
}

function requireReservationId(id: string): number {
  const n = numericId(id);
  if (n === null) throw new ServiceError("not_found", "We could not find that reservation.");
  return n;
}

export const apiPartnerDataRepository: PartnerDataRepository = {
  async getStats() {
    const [cars, stats, confirmed] = await Promise.all([
      guard(() => partnerService.listCars()),
      guard(() => partnerService.getReservationStats()),
      guard(() => partnerService.listReservations({ status: "confirmed", limit: 100 })),
    ]);
    const mapped = cars.map(mapPartnerCar);
    const now = nowWall();
    // A car counts as booked today when a confirmed reservation is under way.
    const underWay = new Set(
      confirmed.reservations.map(mapPartnerReservation).filter((r) => r.pickupDate <= now && now < r.returnDate).map((r) => r.carId),
    );
    return {
      totalCars: mapped.length,
      availableCars: mapped.filter((c) => c.status === "available").length,
      bookedCars: underWay.size,
      pendingReservations: stats.pending,
      upcomingReservations: stats.upcoming,
      totalReservations: stats.total,
    };
  },

  async listCars() {
    return (await guard(() => partnerService.listCars())).map(mapPartnerCar);
  },

  async getCar(_partnerId, carId) {
    const id = numericId(carId);
    if (id === null) return null;
    try {
      return mapPartnerCar(await guard(() => partnerService.getCar(id)));
    } catch (e) {
      if (isServiceError(e) && e.code === "not_found") return null;
      throw e;
    }
  },

  async createCar(_partnerId, input) {
    return mapPartnerCar(await guard(() => partnerService.createCar(toApiCarInput(input))));
  },

  async updateCar(_partnerId, carId, input, listingStatus) {
    const body: Partial<CarInput> = { ...toApiCarInput(input), status: toApiStatus(listingStatus) };
    if (body.status === undefined) delete body.status;
    return mapPartnerCar(await guard(() => partnerService.updateCar(requireId(carId), body)));
  },

  async deleteCar(_partnerId, carId) {
    const result = await guard(() => partnerService.deleteCar(requireId(carId)));
    if (result.deactivated && !result.deleted) {
      // The server keeps cars that have reservation history. Say so instead of reporting a deletion.
      throw new ServiceError("conflict", "This car has reservation history, so it was deactivated instead of deleted.");
    }
  },

  async uploadCarImage(file, opts = {}) {
    const carId = opts.carId === undefined ? undefined : requireId(opts.carId);
    return guard(() => partnerService.uploadCarImage(file, { carId, onProgress: opts.onProgress }));
  },

  async getAvailability(_partnerId, carId, month) {
    const id = requireId(carId);
    const startDate = `${month.slice(0, 7)}-01`;
    const endDate = addDays(addMonths(startDate, 1), -1);
    // The partner endpoint answers for every car the partner owns, published or not.
    const a = await guard(() => partnerService.getCarAvailability(id, { startDate, endDate }));
    const booked = new Set((a.bookedDates ?? []).map(toDateKey));
    const blocked = new Set((a.unavailableDates ?? []).map(toDateKey));
    return Array.from({ length: daysInMonth(startDate) }, (_, i): Availability => {
      const date = addDays(startDate, i);
      const status: CarDayStatus = booked.has(date) ? "booked" : blocked.has(date) ? "unavailable" : "available";
      return { id: `${carId}:${date}`, carId, date, status };
    });
  },

  async setAvailability(_partnerId, carId, dates, status) {
    await guard(() => partnerService.setCarAvailability(requireId(carId), dates.map(dateOf), status), "conflict");
  },

  async listReservations(_partnerId, filters = {}) {
    const { reservations } = await guard(() => partnerService.listReservations({ ...filters, limit: 100 }));
    return reservations.map(mapPartnerReservation);
  },

  async getReservation(_partnerId, reservationId) {
    const id = numericId(reservationId);
    if (id === null) return null;
    try {
      return mapPartnerReservation(await guard(() => partnerService.getReservation(id)));
    } catch (e) {
      // 404 covers both "does not exist" and "belongs to another partner".
      if (isServiceError(e) && e.code === "not_found") return null;
      throw e;
    }
  },

  async approveReservation(_partnerId, reservationId) {
    return mapPartnerReservation(await guard(() => partnerService.approveReservation(requireReservationId(reservationId)), "conflict"));
  },

  async rejectReservation(_partnerId, reservationId, reason) {
    return mapPartnerReservation(await guard(() => partnerService.rejectReservation(requireReservationId(reservationId), reason), "conflict"));
  },

  async completeReservation(_partnerId, reservationId) {
    return mapPartnerReservation(await guard(() => partnerService.completeReservation(requireReservationId(reservationId)), "conflict"));
  },
};
