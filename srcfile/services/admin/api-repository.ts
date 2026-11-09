import { rentalDays } from "@/lib/date";
import { tokenStore } from "@/lib/api-client";
import type { Car as ApiCar, PartnerProfile, Reservation as ApiReservation, User } from "@/types/api";
import type {
  Admin,
  AdminActivity,
  AdminCar,
  AdminCarDetail,
  AdminCarView,
  AdminCustomer,
  AdminCustomerDetail,
  AdminCustomerRow,
  AdminDashboard,
  AdminLocation,
  AdminPartner,
  AdminPartnerDetail,
  AdminPartnerRow,
  AdminReservation,
  AdminReservationDetail,
  AdminReservationView,
  CarApprovalStatus,
} from "@/types/admin";
import { adminService } from "../api/admin.service";
import { authService } from "../api/auth.service";
import { fetchAll } from "../api/paginate";
import { guard, isServiceError, ServiceError, toLoginError, toServiceError, unavailable } from "../errors";
import { bodyTypeFromApi, locationFromText, locationsFromCars } from "../mappers/cars";
import { idOf, orEmpty, paintFor, toWallClock } from "../mappers/common";
import type {
  AdminAuthRepository,
  AdminCarRepository,
  AdminCustomerRepository,
  AdminDashboardRepository,
  AdminPartnerRepository,
  AdminReservationRepository,
  AdminSettingsRepository,
} from "./contracts";

// ------------------------------------------------------------------ loading

const loadCustomers = () => guard(() => fetchAll((page, limit) => adminService.getCustomers({ page, limit }).then(({ customers, meta }) => ({ items: customers, meta }))));
const loadPartners = () => guard(() => fetchAll((page, limit) => adminService.getPartners({ page, limit }).then(({ partners, meta }) => ({ items: partners, meta }))));
const loadCars = () => guard(() => fetchAll((page, limit) => adminService.getCars({ page, limit }).then(({ cars, meta }) => ({ items: cars, meta }))));
const loadReservations = () => guard(() => fetchAll((page, limit) => adminService.getReservations({ page, limit }).then(({ reservations, meta }) => ({ items: reservations, meta }))));

// ------------------------------------------------------------------ mapping

const customerStatus = (u: User): AdminCustomer["status"] => (u.status === "suspended" ? "inactive" : "active");

function toCustomer(u: User): AdminCustomer {
  return { id: idOf(u.id), name: u.name, email: u.email, phone: orEmpty(u.phone), status: customerStatus(u), createdAt: u.createdAt };
}

function toPartner(p: PartnerProfile): AdminPartner {
  return {
    id: idOf(p.id),
    name: orEmpty(p.name),
    companyName: orEmpty(p.companyName),
    email: orEmpty(p.email),
    phone: orEmpty(p.phone),
    status: p.status,
    createdAt: p.createdAt,
  };
}

function toCar(c: ApiCar): AdminCar {
  const id = idOf(c.id);
  return {
    id,
    partnerId: idOf(c.partnerId),
    make: c.make,
    model: c.model,
    year: c.year,
    bodyType: bodyTypeFromApi(c.type),
    locationId: locationFromText(c.location).id,
    paint: paintFor(id),
    imageSrc: c.images?.[0] || undefined,
    dailyPrice: c.dailyPrice,
    status: c.status === "active" ? "available" : "unavailable",
    approvalStatus: c.approvalStatus,
    createdAt: c.createdAt,
  };
}

function toReservation(r: ApiReservation): AdminReservation {
  return {
    id: idOf(r.id),
    customerId: idOf(r.customerId),
    partnerId: idOf(r.partnerId),
    carId: idOf(r.carId),
    pickupLocation: orEmpty(r.pickupLocation),
    pickupDate: toWallClock(r.pickupDate),
    returnDate: toWallClock(r.returnDate),
    status: r.status,
    dailyPrice: r.dailyPrice,
    totalPrice: r.totalPrice,
    createdAt: r.createdAt,
  };
}

const carNameOf = (r: ApiReservation) => [r.carMake, r.carModel].filter(Boolean).join(" ").trim();

function toReservationView(r: ApiReservation): AdminReservationView {
  return { ...toReservation(r), customerName: orEmpty(r.customerName), partnerName: orEmpty(r.partnerCompanyName), carName: carNameOf(r) };
}

/** How many reservations each id has, and which cars are out on a rental right now. */
function reservationStats(reservations: ApiReservation[]) {
  const byCar = new Map<string, number>();
  const byCustomer = new Map<string, number>();
  const byPartner = new Map<string, number>();
  const rentedNow = new Set<string>();
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  for (const r of reservations) {
    bump(byCar, idOf(r.carId));
    bump(byCustomer, idOf(r.customerId));
    bump(byPartner, idOf(r.partnerId));
    if (r.status === "active") rentedNow.add(idOf(r.carId));
  }
  return { byCar, byCustomer, byPartner, rentedNow };
}
type Stats = ReturnType<typeof reservationStats>;

function toCarView(c: ApiCar, stats: Stats): AdminCarView {
  const car = toCar(c);
  return {
    ...car,
    status: stats.rentedNow.has(car.id) ? "booked" : car.status,
    partnerName: orEmpty(c.partnerCompanyName),
    locationName: orEmpty(c.location),
    reservationCount: stats.byCar.get(car.id) ?? 0,
  };
}

const toCustomerRow = (u: User, stats: Stats): AdminCustomerRow => ({ ...toCustomer(u), reservationCount: stats.byCustomer.get(idOf(u.id)) ?? 0 });

function toPartnerRow(p: PartnerProfile, cars: ApiCar[], stats: Stats): AdminPartnerRow {
  const id = idOf(p.id);
  return { ...toPartner(p), carCount: cars.filter((c) => idOf(c.partnerId) === id).length, reservationCount: stats.byPartner.get(id) ?? 0 };
}

const notFoundToNull = async <T>(load: () => Promise<T | null>): Promise<T | null> => {
  try {
    return await load();
  } catch (e) {
    if (isServiceError(e) && e.code === "not_found") return null;
    throw e;
  }
};

// --------------------------------------------------------------------- auth

const NOT_ADMIN = "This is not an admin account.";

export const apiAdminAuth: AdminAuthRepository = {
  async loginAdmin({ email, password, remember }) {
    let user;
    try {
      user = await authService.login(email, password, remember, "admin");
    } catch (e) {
      throw toLoginError(e);
    }
    if (user.role !== "admin") {
      tokenStore.clear();
      throw new ServiceError("invalid_credentials", NOT_ADMIN);
    }
    return toAdmin(user);
  },

  async getAdmin() {
    if (!authService.hasToken()) return null;
    try {
      const user = await authService.me();
      return user.role === "admin" ? toAdmin(user) : null;
    } catch (e) {
      const err = toServiceError(e);
      if (isServiceError(err) && (err.code === "unauthenticated" || err.code === "forbidden")) return null;
      throw err;
    }
  },

  async logoutAdmin() {
    await authService.logout().catch(() => undefined);
  },
};

// The API has a single "admin" role, so every signed-in admin is shown with it.
const toAdmin = (u: User): Admin => ({ id: idOf(u.id), name: u.name, email: u.email, role: "admin" });

// ---------------------------------------------------------------- customers

export const apiAdminCustomers: AdminCustomerRepository = {
  async getCustomers() {
    const [customers, reservations] = await Promise.all([loadCustomers(), loadReservations()]);
    const stats = reservationStats(reservations);
    return customers.map((u) => toCustomerRow(u, stats));
  },

  async getCustomerById(id) {
    const [customers, reservations] = await Promise.all([loadCustomers(), loadReservations()]);
    const user = customers.find((u) => idOf(u.id) === id);
    if (!user) return null;
    const stats = reservationStats(reservations);
    return { ...toCustomerRow(user, stats), reservations: reservations.filter((r) => idOf(r.customerId) === id).map(toReservationView) };
  },

  async updateCustomer() {
    return unavailable("Editing a customer");
  },

  async updateCustomerStatus() {
    return unavailable("Changing a customer's status");
  },
};

// ----------------------------------------------------------------- partners

export const apiAdminPartners: AdminPartnerRepository = {
  async getPartners() {
    const [partners, cars, reservations] = await Promise.all([loadPartners(), loadCars(), loadReservations()]);
    const stats = reservationStats(reservations);
    return partners.map((p) => toPartnerRow(p, cars, stats));
  },

  async getPartnerById(id) {
    const [partners, cars, reservations] = await Promise.all([loadPartners(), loadCars(), loadReservations()]);
    const partner = partners.find((p) => idOf(p.id) === id);
    if (!partner) return null;
    const stats = reservationStats(reservations);
    return {
      ...toPartnerRow(partner, cars, stats),
      cars: cars.filter((c) => idOf(c.partnerId) === id).map((c) => toCarView(c, stats)),
      reservations: reservations.filter((r) => idOf(r.partnerId) === id).map(toReservationView),
    };
  },

  async updatePartnerStatus(id, status) {
    const numeric = Number(id);
    if (!Number.isInteger(numeric)) throw new ServiceError("not_found", "We could not find that partner.");
    if (status === "pending") return unavailable("Moving a partner back to pending");
    await guard(() => (status === "active" ? adminService.activatePartner(numeric) : adminService.suspendPartner(numeric)), "conflict");
    // Read the partner back so the row shows exactly what the server stored.
    const [partners, cars, reservations] = await Promise.all([loadPartners(), loadCars(), loadReservations()]);
    const partner = partners.find((p) => idOf(p.id) === id);
    if (!partner) throw new ServiceError("not_found", "We could not find that partner.");
    return toPartnerRow(partner, cars, reservationStats(reservations));
  },
};

// ---------------------------------------------------------------- dashboard

const ACTIVITY_LIMIT = 8;

/**
 * Computed from the same lists the admin screens use, so the numbers can never disagree
 * with the tables. Swap for GET /admin/dashboard once its `stats` keys are fixed in the contract.
 */
export const apiAdminDashboard: AdminDashboardRepository = {
  async getDashboard(): Promise<AdminDashboard> {
    const [customers, partners, cars, reservations] = await Promise.all([loadCustomers(), loadPartners(), loadCars(), loadReservations()]);
    const stats = reservationStats(reservations);
    const carViews = cars.map((c) => toCarView(c, stats));

    const activity: AdminActivity[] = [
      ...customers.map((u): AdminActivity => ({ id: `customer-${u.id}`, type: "customer_registered", name: u.name, detail: u.email, occurredAt: u.createdAt, status: customerStatus(u), href: `/admin/customers/${u.id}` })),
      ...partners.map((p): AdminActivity => ({ id: `partner-${p.id}`, type: "partner_registered", name: orEmpty(p.companyName) || orEmpty(p.name), detail: orEmpty(p.email), occurredAt: p.createdAt, status: p.status, href: `/admin/partners/${p.id}` })),
      ...cars.map((c): AdminActivity => ({ id: `car-${c.id}`, type: "car_added", name: `${c.make} ${c.model}`, detail: orEmpty(c.partnerCompanyName), occurredAt: c.createdAt, status: c.approvalStatus, href: `/admin/cars/${c.id}` })),
      ...reservations.map((r): AdminActivity => ({ id: `reservation-${r.id}`, type: "reservation_created", name: carNameOf(r) || `Reservation ${r.id}`, detail: orEmpty(r.customerName), occurredAt: r.createdAt, status: r.status, href: `/admin/reservations/${r.id}` })),
    ]
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, ACTIVITY_LIMIT);

    return {
      stats: {
        totalCustomers: customers.length,
        totalPartners: partners.length,
        totalCars: cars.length,
        availableCars: carViews.filter((c) => c.approvalStatus === "approved" && c.status === "available").length,
        bookedCars: carViews.filter((c) => c.status === "booked").length,
        totalReservations: reservations.length,
        upcomingReservations: reservations.filter((r) => r.status === "upcoming").length,
        completedReservations: reservations.filter((r) => r.status === "completed").length,
      },
      attention: {
        pendingPartners: partners.filter((p) => p.status === "pending").length,
        pendingCars: cars.filter((c) => c.approvalStatus === "pending").length,
        inactiveCustomers: customers.filter((u) => u.status === "suspended").length,
      },
      activity,
    };
  },
};

// --------------------------------------------------------------------- cars

function carId(id: string): number {
  const n = Number(id);
  if (!Number.isInteger(n)) throw new ServiceError("not_found", "We could not find that car.");
  return n;
}

/** Re-reads a car after an approval step so the row carries its real booking counts. */
async function viewAfter(updated: ApiCar): Promise<AdminCarView> {
  return toCarView(updated, reservationStats(await loadReservations()));
}

export const apiAdminCars: AdminCarRepository = {
  async getCars() {
    const [cars, reservations] = await Promise.all([loadCars(), loadReservations()]);
    const stats = reservationStats(reservations);
    return cars.map((c) => toCarView(c, stats));
  },

  async getCarById(id) {
    return notFoundToNull(async (): Promise<AdminCarDetail | null> => {
      const [cars, partners, reservations] = await Promise.all([loadCars(), loadPartners(), loadReservations()]);
      const car = cars.find((c) => idOf(c.id) === id);
      if (!car) return null;
      const stats = reservationStats(reservations);
      const profile = partners.find((p) => idOf(p.id) === idOf(car.partnerId));
      const partner: AdminPartner = profile
        ? toPartner(profile)
        : { id: idOf(car.partnerId), name: "", companyName: orEmpty(car.partnerCompanyName), email: "", phone: "", status: "active", createdAt: car.createdAt };
      return { ...toCarView(car, stats), partner, reservations: reservations.filter((r) => idOf(r.carId) === id).map(toReservationView) };
    });
  },

  async getCarLocations(): Promise<AdminLocation[]> {
    const cars = await loadCars();
    return locationsFromCars(cars).map((l) => ({ id: l.id, name: l.name }));
  },

  async updateCar() {
    return unavailable("Editing a car");
  },

  async updateCarStatus(id, status: Exclude<CarApprovalStatus, "pending">) {
    if (status === "approved") return this.approveCar(id);
    if (status === "rejected") return this.rejectCar(id);
    return this.suspendCar(id);
  },

  async approveCar(id) {
    return viewAfter(await guard(() => adminService.approveCar(carId(id)), "conflict"));
  },

  async rejectCar(id) {
    return viewAfter(await guard(() => adminService.rejectCar(carId(id)), "conflict"));
  },

  async suspendCar(id) {
    return viewAfter(await guard(() => adminService.suspendCar(carId(id)), "conflict"));
  },

  /** The API has no separate activate call: approving a suspended car puts it back on the platform. The server decides if that is allowed. */
  async activateCar(id) {
    return this.approveCar(id);
  },

  async deleteCar() {
    return unavailable("Deleting a car");
  },
};

// ------------------------------------------------------------- reservations

export const apiAdminReservations: AdminReservationRepository = {
  async getReservations() {
    return (await loadReservations()).map(toReservationView);
  },

  async getReservationById(id) {
    const [reservations, customers, partners, cars] = await Promise.all([loadReservations(), loadCustomers(), loadPartners(), loadCars()]);
    const r = reservations.find((x) => idOf(x.id) === id);
    if (!r) return null;

    const user = customers.find((u) => u.id === r.customerId);
    const customer: AdminCustomer = user ? toCustomer(user) : { id: idOf(r.customerId), name: orEmpty(r.customerName), email: orEmpty(r.customerEmail), phone: "", status: "active", createdAt: r.createdAt };

    const profile = partners.find((p) => p.id === r.partnerId);
    const partner: AdminPartner = profile ? toPartner(profile) : { id: idOf(r.partnerId), name: "", companyName: orEmpty(r.partnerCompanyName), email: "", phone: "", status: "active", createdAt: r.createdAt };

    const apiCar = cars.find((c) => c.id === r.carId);
    // A car missing from the admin catalogue is shown from the reservation's own copy of its details, as not on offer.
    const car: AdminCar = apiCar
      ? toCar(apiCar)
      : {
          id: idOf(r.carId),
          partnerId: idOf(r.partnerId),
          make: orEmpty(r.carMake),
          model: orEmpty(r.carModel),
          year: r.carYear ?? 0,
          bodyType: bodyTypeFromApi(orEmpty(r.carType)),
          locationId: locationFromText(orEmpty(r.pickupLocation)).id,
          paint: paintFor(idOf(r.carId)),
          imageSrc: r.carImage || undefined,
          dailyPrice: r.dailyPrice,
          status: "unavailable",
          approvalStatus: "suspended",
          createdAt: r.createdAt,
        };

    const view = toReservationView(r);
    return { ...view, customer, partner, car, carLocationName: orEmpty(apiCar?.location ?? r.pickupLocation), days: rentalDays(view.pickupDate, view.returnDate) };
  },
};

// ----------------------------------------------------------------- settings

/** The backend has no platform-settings endpoint yet, so the screen reports that instead of showing made-up defaults. */
export const apiAdminSettings: AdminSettingsRepository = {
  async getSettings() {
    return unavailable("Platform settings");
  },
  async updateSettings() {
    return unavailable("Saving platform settings");
  },
};
