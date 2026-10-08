import { delay } from "@/lib/browser-storage";
import { ServiceError } from "@/services/errors";
import type { AdminCarUpdate, CarApprovalStatus } from "@/types/admin";
import type { AdminCarRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { allCars, allLocations, allReservations, carDetail, carName, carViews, saveCarPatch } from "./store";

const BODY_TYPES = ["sedan", "suv", "hatch", "coupe"];
const MIN_YEAR = 1990;

const viewFor = (id: string) => {
  const view = carViews().find((c) => c.id === id);
  if (!view) throw new ServiceError("not_found", "That car no longer exists.");
  return view;
};

/**
 * The approval workflow in one place. Anything else is refused with a conflict, so
 * a stale screen (for example two admins on the same car) can never skip a step.
 */
function moveCar(id: string, allowedFrom: CarApprovalStatus[], to: CarApprovalStatus, problem: string) {
  const car = allCars().find((c) => c.id === id);
  if (!car) throw new ServiceError("not_found", "That car no longer exists.");
  if (!allowedFrom.includes(car.approvalStatus)) {
    throw new ServiceError("conflict", `${carName(car)} ${problem} It may have been changed by someone else, so reload and try again.`);
  }
  saveCarPatch(id, { approvalStatus: to });
  return viewFor(id);
}

function validateUpdate(input: AdminCarUpdate) {
  const fail = (field: string, message: string): never => {
    throw new ServiceError("invalid_input", message, field);
  };
  if (!input.make.trim()) fail("make", "Enter the make.");
  if (!input.model.trim()) fail("model", "Enter the model.");
  if (!Number.isInteger(input.year) || input.year < MIN_YEAR || input.year > new Date().getFullYear() + 1) {
    fail("year", `Enter a year between ${MIN_YEAR} and ${new Date().getFullYear() + 1}.`);
  }
  if (!BODY_TYPES.includes(input.bodyType)) fail("bodyType", "Choose a car type.");
  if (!allLocations().some((l) => l.id === input.locationId)) fail("locationId", "Choose a pickup location.");
  if (!Number.isFinite(input.dailyPrice) || input.dailyPrice <= 0) fail("dailyPrice", "Enter a daily price above zero.");
  if (input.status !== "available" && input.status !== "unavailable") fail("status", "Choose an availability.");
}

const MOVES: Record<Exclude<CarApprovalStatus, "pending">, { from: CarApprovalStatus[]; problem: string }> = {
  approved: { from: ["pending", "rejected", "suspended"], problem: "cannot be approved from its current status." },
  rejected: { from: ["pending"], problem: "is not waiting for approval, so it cannot be rejected." },
  suspended: { from: ["approved"], problem: "is not active, so it cannot be suspended." },
};

export const mockAdminCars: AdminCarRepository = {
  async getCars() {
    await delay(350);
    requireMockAdminSession();
    return carViews().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getCarById(id) {
    await delay(250);
    requireMockAdminSession();
    return carDetail(id);
  },

  async getCarLocations() {
    await delay(100);
    requireMockAdminSession();
    return allLocations();
  },

  async updateCar(id, input) {
    await delay(300);
    requireMockAdminSession();
    validateUpdate(input);
    const current = allCars().find((c) => c.id === id);
    if (!current) throw new ServiceError("not_found", "That car no longer exists.");
    // A car that is out on a rental stays "booked" until the rental ends; owners cannot flip it by hand.
    const status = current.status === "booked" ? "booked" : input.status;
    saveCarPatch(id, {
      make: input.make.trim(),
      model: input.model.trim(),
      year: input.year,
      bodyType: input.bodyType,
      locationId: input.locationId,
      dailyPrice: input.dailyPrice,
      status,
    });
    return viewFor(id);
  },

  async updateCarStatus(id, status) {
    await delay(200);
    requireMockAdminSession();
    const move = MOVES[status];
    if (!move) throw new ServiceError("invalid_input", "Choose a valid car status.", "status");
    return moveCar(id, move.from, status, move.problem);
  },

  async approveCar(id) {
    await delay(200);
    requireMockAdminSession();
    return moveCar(id, ["pending", "rejected"], "approved", "cannot be approved from its current status.");
  },

  async rejectCar(id) {
    await delay(200);
    requireMockAdminSession();
    return moveCar(id, ["pending"], "rejected", "is not waiting for approval, so it cannot be rejected.");
  },

  async suspendCar(id) {
    await delay(200);
    requireMockAdminSession();
    return moveCar(id, ["approved"], "suspended", "is not active, so it cannot be suspended.");
  },

  async activateCar(id) {
    await delay(200);
    requireMockAdminSession();
    return moveCar(id, ["suspended"], "approved", "is not suspended, so it cannot be activated.");
  },

  async deleteCar(id) {
    await delay(250);
    requireMockAdminSession();
    const car = allCars().find((c) => c.id === id);
    if (!car) throw new ServiceError("not_found", "That car no longer exists.");
    const open = allReservations().filter((r) => r.carId === id && (r.status === "upcoming" || r.status === "active")).length;
    if (open > 0) {
      throw new ServiceError("conflict", `${carName(car)} has ${open} upcoming or active reservation${open === 1 ? "" : "s"}. Suspend it instead, or wait until they finish.`);
    }
    saveCarPatch(id, { deleted: true });
  },
};
