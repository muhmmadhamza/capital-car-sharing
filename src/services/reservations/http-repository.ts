import type { Reservation } from "@/types/reservation";
import { ServiceError, type ServiceErrorCode } from "../errors";
import type { ReservationsRepository } from "./repository";

/** Talks to the Node.js/PostgreSQL API. Not used until NEXT_PUBLIC_CUSTOMER_DATA_SOURCE=api. */
const baseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1${path}`, { credentials: "include", headers: { Accept: "application/json" }, ...init });
  } catch {
    throw new ServiceError("network", "We could not reach the server. Check your connection and try again.");
  }
  const body = (await res.json().catch(() => null)) as (T & { code?: ServiceErrorCode; message?: string }) | null;
  if (!res.ok) {
    const code = body?.code ?? (res.status === 401 ? "unauthenticated" : res.status === 404 ? "not_found" : "invalid_input");
    throw new ServiceError(code, body?.message ?? "Request failed.");
  }
  return body as T;
}

// The session cookie identifies the customer, so customerId is not sent.
export const httpReservationsRepository: ReservationsRepository = {
  listForCustomer: () => request<Reservation[]>("/customers/me/reservations"),
  async getById(id) {
    try {
      return await request<Reservation>(`/customers/me/reservations/${encodeURIComponent(id)}`);
    } catch (e) {
      if (e instanceof ServiceError && e.code === "not_found") return null;
      throw e;
    }
  },
  cancel: (id) => request<Reservation>(`/customers/me/reservations/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
};
