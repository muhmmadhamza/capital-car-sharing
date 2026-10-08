import type { DateKey } from "@/types/booking";
import type { Availability, PartnerCarView, PartnerReservationView, PartnerStats } from "@/types/partner";
import { ServiceError, type ServiceErrorCode } from "../errors";
import type { PartnerDataRepository } from "./repository";

/**
 * Talks to the Node.js/PostgreSQL API. Not used until
 * NEXT_PUBLIC_PARTNER_DATA_SOURCE=api and the endpoints in repository.ts exist.
 * The partner id is ignored here: the API reads it from the session cookie.
 */
const baseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1${path}`, {
      credentials: "include",
      ...init,
      headers: { Accept: "application/json", ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...init?.headers },
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

async function orNull<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ServiceError && e.code === "not_found") return null;
    throw e;
  }
}

export const httpPartnerDataRepository: PartnerDataRepository = {
  getStats: () => request<PartnerStats>("/partner/stats"),
  listCars: () => request<PartnerCarView[]>("/partner/cars"),
  getCar: (_p, carId) => orNull(request<PartnerCarView>(`/partner/cars/${encodeURIComponent(carId)}`)),
  createCar: (_p, input) => request<PartnerCarView>("/partner/cars", { method: "POST", ...json(input) }),
  updateCar: (_p, carId, input, listingStatus) =>
    request<PartnerCarView>(`/partner/cars/${encodeURIComponent(carId)}`, { method: "PATCH", ...json({ ...input, listingStatus }) }),
  deleteCar: (_p, carId) => request<void>(`/partner/cars/${encodeURIComponent(carId)}`, { method: "DELETE" }),
  async uploadCarImage(file) {
    const form = new FormData();
    form.set("image", file);
    const { url } = await request<{ url: string }>("/partner/cars/images", { method: "POST", body: form });
    return url;
  },
  getAvailability: (_p, carId, month: DateKey) =>
    request<Availability[]>(`/partner/cars/${encodeURIComponent(carId)}/availability?month=${encodeURIComponent(month)}`),
  setAvailability: (_p, carId, dates, status) =>
    request<void>(`/partner/cars/${encodeURIComponent(carId)}/availability`, { method: "PUT", ...json({ dates, status }) }),
  listReservations: () => request<PartnerReservationView[]>("/partner/reservations"),
  getReservation: (_p, id) => orNull(request<PartnerReservationView>(`/partner/reservations/${encodeURIComponent(id)}`)),
};
