import { adminCars } from "@/data/mock/admin/cars";
import { adminCustomers } from "@/data/mock/admin/customers";
import { adminLocations, locationName } from "@/data/mock/admin/locations";
import { adminPartners } from "@/data/mock/admin/partners";
import { adminReservations } from "@/data/mock/admin/reservations";
import { siteConfig } from "@/config/site";
import { rentalDays } from "@/lib/date";
import { readJson, writeJson } from "@/lib/browser-storage";
import type {
  AdminCar,
  AdminCarDetail,
  AdminCarView,
  AdminCustomer,
  AdminCustomerRow,
  AdminLocation,
  AdminPartner,
  AdminPartnerRow,
  AdminReservation,
  AdminReservationDetail,
  AdminReservationView,
  AdminSettings,
  CustomerStatus,
  PartnerStatus,
} from "@/types/admin";
import { ServiceError } from "@/services/errors";

/**
 * Browser-only mock "database" for the admin area. The seed data in
 * src/data/mock/admin never changes; edits an admin makes are kept as small
 * patches in localStorage under their own keys, so they survive a refresh and
 * never touch the customer or partner mocks. Clear the keys to reset the demo.
 */
const CUSTOMER_PATCHES_KEY = "ccs.mock.admin.customerPatches";
const PARTNER_PATCHES_KEY = "ccs.mock.admin.partnerPatches";
const CAR_PATCHES_KEY = "ccs.mock.admin.carPatches";
const SETTINGS_KEY = "ccs.mock.admin.settings";

type CustomerPatch = Partial<Pick<AdminCustomer, "name" | "email" | "phone" | "status">>;
type PartnerPatch = Partial<Pick<AdminPartner, "status">>;
/** `deleted` hides the car from every list. Reservations keep resolving its name for history. */
type CarPatch = Partial<Pick<AdminCar, "make" | "model" | "year" | "bodyType" | "locationId" | "dailyPrice" | "status" | "approvalStatus">> & { deleted?: boolean };

const customerPatches = () => readJson<Record<string, CustomerPatch>>(CUSTOMER_PATCHES_KEY, {});
const partnerPatches = () => readJson<Record<string, PartnerPatch>>(PARTNER_PATCHES_KEY, {});
const carPatches = () => readJson<Record<string, CarPatch>>(CAR_PATCHES_KEY, {});

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export function allCustomers(): AdminCustomer[] {
  const patches = customerPatches();
  return adminCustomers.map((c) => ({ ...c, ...patches[c.id] }));
}

export function allPartners(): AdminPartner[] {
  const patches = partnerPatches();
  return adminPartners.map((p) => ({ ...p, ...patches[p.id] }));
}

/** Every car ever seeded, including deleted ones. Used to keep names on historical reservations. */
function everyCar(): AdminCar[] {
  const patches = carPatches();
  return adminCars.map(({ ...c }) => {
    const { deleted: _deleted, ...fields } = patches[c.id] ?? {};
    return { ...c, ...fields };
  });
}

/** Cars that exist on the platform. Deleted cars are gone from every admin list. */
export function allCars(): AdminCar[] {
  const patches = carPatches();
  return everyCar().filter((c) => !patches[c.id]?.deleted);
}

export const allLocations = (): AdminLocation[] => adminLocations;
export const allReservations = (): AdminReservation[] => adminReservations;

export function saveCustomerPatch(id: string, patch: CustomerPatch): AdminCustomer {
  const current = allCustomers().find((c) => c.id === id);
  if (!current) throw new ServiceError("not_found", "That customer no longer exists.");
  writeJson(CUSTOMER_PATCHES_KEY, { ...customerPatches(), [id]: { ...customerPatches()[id], ...patch } });
  return { ...current, ...patch };
}

export function savePartnerPatch(id: string, patch: PartnerPatch): AdminPartner {
  const current = allPartners().find((p) => p.id === id);
  if (!current) throw new ServiceError("not_found", "That partner no longer exists.");
  writeJson(PARTNER_PATCHES_KEY, { ...partnerPatches(), [id]: { ...partnerPatches()[id], ...patch } });
  return { ...current, ...patch };
}

export const setCustomerStatusInStore = (id: string, status: CustomerStatus) => saveCustomerPatch(id, { status });
export const setPartnerStatusInStore = (id: string, status: PartnerStatus) => savePartnerPatch(id, { status });

export function saveCarPatch(id: string, patch: CarPatch): AdminCar {
  const current = allCars().find((c) => c.id === id);
  if (!current) throw new ServiceError("not_found", "That car no longer exists.");
  writeJson(CAR_PATCHES_KEY, { ...carPatches(), [id]: { ...carPatches()[id], ...patch } });
  const { deleted: _deleted, ...fields } = patch;
  return { ...current, ...fields };
}

// ------------------------------------------------------------------- settings

/** Defaults come from the site config, so the first load matches the public site. */
const DEFAULT_SETTINGS: AdminSettings = {
  platformName: siteConfig.name,
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
  currency: siteConfig.currency,
  defaultDailyRate: 60,
  minRentalDays: 1,
  maxRentalDays: 30,
};

export const readSettings = (): AdminSettings => ({ ...DEFAULT_SETTINGS, ...readJson<Partial<AdminSettings>>(SETTINGS_KEY, {}) });
export const saveSettings = (settings: AdminSettings): AdminSettings => {
  writeJson(SETTINGS_KEY, settings);
  return readSettings();
};

// ----------------------------------------------------------------------- joins

export const carName = (car: Pick<AdminCar, "make" | "model" | "year">) => `${car.make} ${car.model} ${car.year}`;

export function reservationViews(): AdminReservationView[] {
  const customers = new Map(allCustomers().map((c) => [c.id, c]));
  const partners = new Map(allPartners().map((p) => [p.id, p]));
  const cars = new Map(everyCar().map((c) => [c.id, c]));
  return allReservations().map((r) => {
    const car = cars.get(r.carId);
    const partner = partners.get(r.partnerId);
    return {
      ...r,
      customerName: customers.get(r.customerId)?.name ?? "Unknown customer",
      partnerName: partner?.companyName ?? partner?.name ?? "Unknown partner",
      carName: car ? carName(car) : "Unknown car",
    };
  });
}

export function carViews(): AdminCarView[] {
  const partners = new Map(allPartners().map((p) => [p.id, p]));
  const reservations = allReservations();
  return allCars().map((c) => ({
    ...c,
    partnerName: partners.get(c.partnerId)?.companyName ?? "Unknown partner",
    locationName: locationName(c.locationId),
    reservationCount: reservations.filter((r) => r.carId === c.id).length,
  }));
}

/** One car with its owner and booking history. Null when the car does not exist. */
export function carDetail(id: string): AdminCarDetail | null {
  const view = carViews().find((c) => c.id === id);
  const partner = allPartners().find((p) => p.id === view?.partnerId);
  if (!view || !partner) return null;
  return { ...view, partner, reservations: reservationViews().filter((r) => r.carId === id).sort(byNewestPickup) };
}

/** One reservation with its customer, partner and car resolved by id. Null when it does not exist. */
export function reservationDetail(id: string): AdminReservationDetail | null {
  const view = reservationViews().find((r) => r.id === id);
  if (!view) return null;
  const customer = allCustomers().find((c) => c.id === view.customerId);
  const partner = allPartners().find((p) => p.id === view.partnerId);
  const car = everyCar().find((c) => c.id === view.carId);
  if (!customer || !partner || !car) return null;
  return {
    ...view,
    customer,
    partner,
    car,
    carLocationName: locationName(car.locationId),
    days: rentalDays(view.pickupDate, view.returnDate),
  };
}

export function customerRows(): AdminCustomerRow[] {
  const reservations = allReservations();
  return allCustomers().map((c) => ({ ...c, reservationCount: reservations.filter((r) => r.customerId === c.id).length }));
}

export function partnerRows(): AdminPartnerRow[] {
  const cars = allCars();
  const reservations = allReservations();
  return allPartners().map((p) => ({
    ...p,
    carCount: cars.filter((c) => c.partnerId === p.id).length,
    reservationCount: reservations.filter((r) => r.partnerId === p.id).length,
  }));
}

/** Newest first. */
export const byNewestPickup = (a: AdminReservationView, b: AdminReservationView) => b.pickupDate.localeCompare(a.pickupDate);
