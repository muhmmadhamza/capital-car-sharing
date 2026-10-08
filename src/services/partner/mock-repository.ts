import { getSeedPartnerReservations, getSeedUnavailableDates, mockReservationCustomers } from "@/data/mock/partner-reservations";
import { seedPartnerCars } from "@/data/mock/partner-cars";
import { bookedDates, dayStatus, effectiveStatus, monthAvailability } from "@/features/partners/availability";
import { delay, readJson, writeJson } from "@/lib/browser-storage";
import { dateOf, isDateKey, nowWall, rentalDays } from "@/lib/date";
import { imageFileToDataUrl } from "@/lib/image";
import type { DateKey } from "@/types/booking";
import type { PartnerCar, PartnerCarView, PartnerReservation, PartnerReservationView } from "@/types/partner";
import { ServiceError } from "../errors";
import type { PartnerDataRepository } from "./repository";

/**
 * Browser-only mock. Cars and hand-made unavailable days persist in
 * localStorage, so a car saved on "Add Car" is still there in "My Cars" after
 * a refresh. Reservations are regenerated relative to today, so the demo never
 * goes stale. A real database stores one availability row per day; here only
 * the unavailable days are kept, because every other day is available by default.
 */
const CARS_KEY = "ccs.mock.partner.cars";
const UNAVAILABLE_KEY = "ccs.mock.partner.unavailable";

type UnavailableByCar = Record<string, DateKey[]>;

let cars: PartnerCar[] | null = null;
let unavailable: UnavailableByCar | null = null;
let reservations: PartnerReservation[] | null = null;

function loadCars(): PartnerCar[] {
  if (!cars) {
    const stored = readJson<PartnerCar[] | null>(CARS_KEY, null);
    cars = stored ?? structuredClone(seedPartnerCars);
  }
  return cars;
}
const saveCars = (next: PartnerCar[]) => {
  cars = next;
  writeJson(CARS_KEY, next);
};

function loadUnavailable(): UnavailableByCar {
  if (!unavailable) unavailable = readJson<UnavailableByCar | null>(UNAVAILABLE_KEY, null) ?? getSeedUnavailableDates();
  return unavailable;
}
const saveUnavailable = (next: UnavailableByCar) => {
  unavailable = next;
  writeJson(UNAVAILABLE_KEY, next);
};

function loadReservations(): PartnerReservation[] {
  if (!reservations) reservations = getSeedPartnerReservations();
  return reservations;
}

const ownedCars = (partnerId: string) => loadCars().filter((c) => c.partnerId === partnerId);

function requireCar(partnerId: string, carId: string): PartnerCar {
  const car = loadCars().find((c) => c.id === carId && c.partnerId === partnerId);
  if (!car) throw new ServiceError("not_found", "We could not find that car.");
  return car;
}

function toView(car: PartnerCar): PartnerCarView {
  const all = loadReservations();
  const now = nowWall();
  const status = effectiveStatus(car.status, all, car.id, now);
  const today = dayStatus(dateOf(now), bookedDates(all, car.id), new Set(loadUnavailable()[car.id] ?? []));
  const next = all
    .filter((r) => r.carId === car.id && (r.status === "upcoming" || r.status === "active"))
    .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))[0];
  return { ...car, status, listingStatus: car.status, today, nextReservationAt: next?.pickupDate };
}

function toReservationView(r: PartnerReservation): PartnerReservationView | null {
  const car = loadCars().find((c) => c.id === r.carId);
  const customer = mockReservationCustomers.find((c) => c.id === r.customerId);
  if (!car || !customer) return null;
  return { ...r, car, customer, days: rentalDays(r.pickupDate, r.returnDate) };
}

export const mockPartnerDataRepository: PartnerDataRepository = {
  async getStats(partnerId) {
    await delay(150);
    const views = ownedCars(partnerId).map(toView);
    const mine = loadReservations().filter((r) => r.partnerId === partnerId);
    return {
      totalCars: views.length,
      availableCars: views.filter((c) => c.status === "available").length,
      bookedCars: views.filter((c) => c.status === "booked").length,
      upcomingReservations: mine.filter((r) => r.status === "upcoming").length,
      totalReservations: mine.length,
    };
  },

  async listCars(partnerId) {
    await delay();
    return ownedCars(partnerId)
      .map(toView)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getCar(partnerId, carId) {
    await delay(150);
    const car = ownedCars(partnerId).find((c) => c.id === carId);
    return car ? toView(car) : null;
  },

  async createCar(partnerId, input) {
    await delay(400);
    const car: PartnerCar = {
      ...input,
      id: `pcar_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
      partnerId,
      // New listings wait for verification before renters can see them.
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveCars([...loadCars(), car]);
    return toView(car);
  },

  async updateCar(partnerId, carId, input, listingStatus) {
    await delay(400);
    const current = requireCar(partnerId, carId);
    const status =
      current.status === "pending" || !listingStatus || (listingStatus !== "available" && listingStatus !== "unavailable")
        ? current.status
        : listingStatus;
    const updated: PartnerCar = { ...current, ...input, status };
    saveCars(loadCars().map((c) => (c.id === carId ? updated : c)));
    return toView(updated);
  },

  async deleteCar(partnerId, carId) {
    await delay(300);
    requireCar(partnerId, carId);
    const open = loadReservations().some((r) => r.carId === carId && (r.status === "upcoming" || r.status === "active"));
    if (open) {
      throw new ServiceError("conflict", "This car has upcoming or active reservations. Wait until they finish before deleting it.");
    }
    saveCars(loadCars().filter((c) => c.id !== carId));
    const { [carId]: _removed, ...rest } = loadUnavailable();
    saveUnavailable(rest);
  },

  uploadCarImage: (file) => imageFileToDataUrl(file, { maxSide: 800, quality: 0.72, field: "images" }),

  async getAvailability(partnerId, carId, month) {
    await delay(120);
    requireCar(partnerId, carId);
    return monthAvailability(carId, month, bookedDates(loadReservations(), carId), new Set(loadUnavailable()[carId] ?? []));
  },

  async setAvailability(partnerId, carId, dates, status) {
    await delay(250);
    requireCar(partnerId, carId);
    if (dates.length === 0) return;
    if (!dates.every(isDateKey)) throw new ServiceError("invalid_input", "One of the selected dates is not valid.");
    const today = dateOf(nowWall());
    if (dates.some((d) => d < today)) throw new ServiceError("invalid_input", "Past dates cannot be changed.");
    const booked = bookedDates(loadReservations(), carId);
    if (dates.some((d) => booked.has(d))) {
      throw new ServiceError("conflict", "Booked dates cannot be changed. Deselect them and try again.");
    }
    const set = new Set(loadUnavailable()[carId] ?? []);
    for (const d of dates) {
      if (status === "unavailable") set.add(d);
      else set.delete(d);
    }
    saveUnavailable({ ...loadUnavailable(), [carId]: [...set].sort() });
  },

  async listReservations(partnerId) {
    await delay();
    return loadReservations()
      .filter((r) => r.partnerId === partnerId)
      .flatMap((r) => toReservationView(r) ?? [])
      .sort((a, b) => b.pickupDate.localeCompare(a.pickupDate));
  },

  async getReservation(partnerId, reservationId) {
    await delay(150);
    const r = loadReservations().find((x) => x.id === reservationId && x.partnerId === partnerId);
    return (r && toReservationView(r)) || null;
  },
};
