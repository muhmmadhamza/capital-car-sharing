import type { Customer } from "@/types/customer";
import { ServiceError, type ServiceErrorCode } from "../errors";
import type { AuthRepository } from "./repository";

/**
 * Talks to the Node.js/PostgreSQL API. Not used until
 * NEXT_PUBLIC_CUSTOMER_DATA_SOURCE=api and the endpoints in repository.ts
 * exist. The session is an httpOnly cookie, hence `credentials: "include"`.
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

export const httpAuthRepository: AuthRepository = {
  async getSession() {
    try {
      return await request<Customer>("/customers/me");
    } catch (e) {
      if (e instanceof ServiceError && e.code === "unauthenticated") return null;
      throw e;
    }
  },
  register: (input) => request<Customer>("/auth/register", { method: "POST", ...json(input) }),
  login: (input) => request<Customer>("/auth/login", { method: "POST", ...json(input) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  updateProfile: (input) => request<Customer>("/customers/me", { method: "PATCH", ...json(input) }),
  async uploadAvatar(file) {
    const form = new FormData();
    form.set("avatar", file);
    const { url } = await request<{ url: string }>("/customers/me/avatar", { method: "POST", body: form });
    return url;
  },
};
