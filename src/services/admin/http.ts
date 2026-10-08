import type {
  Admin,
  AdminCarDetail,
  AdminCarView,
  AdminCustomerDetail,
  AdminCustomerRow,
  AdminDashboard,
  AdminLocation,
  AdminPartnerDetail,
  AdminPartnerRow,
  AdminReservationDetail,
  AdminReservationView,
  AdminSettings,
} from "@/types/admin";
import { ServiceError, type ServiceErrorCode } from "../errors";
import type {
  AdminAuthRepository,
  AdminCarRepository,
  AdminCustomerRepository,
  AdminDashboardRepository,
  AdminPartnerRepository,
  AdminReservationRepository,
  AdminSettingsRepository,
} from "./contracts";

/**
 * Talks to the Node.js/PostgreSQL API. Not used until
 * NEXT_PUBLIC_ADMIN_DATA_SOURCE=api and the endpoints in contracts.ts exist.
 */
const baseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1${path}`, {
      credentials: "include",
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ServiceError("network", "We could not reach the server. Check your connection and try again.");
  }
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => null)) as (T & { code?: ServiceErrorCode; message?: string; field?: string }) | null;
  if (!res.ok) {
    throw new ServiceError(body?.code ?? (res.status === 401 ? "unauthenticated" : "invalid_input"), body?.message ?? "Request failed.", body?.field);
  }
  return body as T;
}

const json = (data: unknown): RequestInit => ({ body: JSON.stringify(data) });

export const httpAdminAuth: AdminAuthRepository = {
  loginAdmin: (input) => request<Admin>("/admin/auth/login", { method: "POST", ...json(input) }),
  async getAdmin() {
    try {
      return await request<Admin>("/admin/me");
    } catch (e) {
      if (e instanceof ServiceError && e.code === "unauthenticated") return null;
      throw e;
    }
  },
  logoutAdmin: () => request<void>("/admin/auth/logout", { method: "POST" }),
};

export const httpAdminCustomers: AdminCustomerRepository = {
  getCustomers: () => request<AdminCustomerRow[]>("/admin/customers"),
  async getCustomerById(id) {
    try {
      return await request<AdminCustomerDetail>(`/admin/customers/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") return null;
      throw e;
    }
  },
  updateCustomer: (id, input) => request<AdminCustomerRow>(`/admin/customers/${encodeURIComponent(id)}`, { method: "PATCH", ...json(input) }),
  updateCustomerStatus: (id, status) =>
    request<AdminCustomerRow>(`/admin/customers/${encodeURIComponent(id)}/status`, { method: "PATCH", ...json({ status }) }),
};

export const httpAdminPartners: AdminPartnerRepository = {
  getPartners: () => request<AdminPartnerRow[]>("/admin/partners"),
  async getPartnerById(id) {
    try {
      return await request<AdminPartnerDetail>(`/admin/partners/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") return null;
      throw e;
    }
  },
  updatePartnerStatus: (id, status) =>
    request<AdminPartnerRow>(`/admin/partners/${encodeURIComponent(id)}/status`, { method: "PATCH", ...json({ status }) }),
};

export const httpAdminDashboard: AdminDashboardRepository = {
  getDashboard: () => request<AdminDashboard>("/admin/dashboard"),
};

const carPath = (id: string) => `/admin/cars/${encodeURIComponent(id)}`;

export const httpAdminCars: AdminCarRepository = {
  getCars: () => request<AdminCarView[]>("/admin/cars"),
  async getCarById(id) {
    try {
      return await request<AdminCarDetail>(carPath(id));
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") return null;
      throw e;
    }
  },
  getCarLocations: () => request<AdminLocation[]>("/admin/locations"),
  updateCar: (id, input) => request<AdminCarView>(carPath(id), { method: "PATCH", ...json(input) }),
  updateCarStatus: (id, status) => request<AdminCarView>(`${carPath(id)}/status`, { method: "PATCH", ...json({ status }) }),
  approveCar: (id) => request<AdminCarView>(`${carPath(id)}/approve`, { method: "POST" }),
  rejectCar: (id) => request<AdminCarView>(`${carPath(id)}/reject`, { method: "POST" }),
  suspendCar: (id) => request<AdminCarView>(`${carPath(id)}/suspend`, { method: "POST" }),
  activateCar: (id) => request<AdminCarView>(`${carPath(id)}/activate`, { method: "POST" }),
  deleteCar: (id) => request<void>(carPath(id), { method: "DELETE" }),
};

export const httpAdminReservations: AdminReservationRepository = {
  getReservations: () => request<AdminReservationView[]>("/admin/reservations"),
  async getReservationById(id) {
    try {
      return await request<AdminReservationDetail>(`/admin/reservations/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") return null;
      throw e;
    }
  },
};

export const httpAdminSettings: AdminSettingsRepository = {
  getSettings: () => request<AdminSettings>("/admin/settings"),
  updateSettings: (input) => request<AdminSettings>("/admin/settings", { method: "PUT", ...json(input) }),
};
