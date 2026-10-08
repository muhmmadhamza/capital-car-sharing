import type { Partner } from "@/types/partner";
import { ServiceError, type ServiceErrorCode } from "../errors";
import type { PartnerAuthRepository } from "./repository";

/**
 * Talks to the Node.js/PostgreSQL API. Not used until
 * NEXT_PUBLIC_PARTNER_DATA_SOURCE=api and the endpoints in repository.ts exist.
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

export const httpPartnerAuthRepository: PartnerAuthRepository = {
  async getSession() {
    try {
      return await request<Partner>("/partners/me");
    } catch (e) {
      if (e instanceof ServiceError && e.code === "unauthenticated") return null;
      throw e;
    }
  },
  register: (input) => request<Partner>("/partner/auth/register", { method: "POST", ...json(input) }),
  login: (input) => request<Partner>("/partner/auth/login", { method: "POST", ...json(input) }),
  logout: () => request<void>("/partner/auth/logout", { method: "POST" }),
  updateProfile: (input) => request<Partner>("/partners/me", { method: "PATCH", ...json(input) }),
  async uploadAvatar(file) {
    const form = new FormData();
    form.set("avatar", file);
    const { url } = await request<{ url: string }>("/partners/me/avatar", { method: "POST", body: form });
    return url;
  },
};
