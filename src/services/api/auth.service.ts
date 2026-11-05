import { api, tokenStore } from "@/lib/api-client";
import type { Role, User } from "@/types/api";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Exclude<Role, "admin">;
  companyName?: string;
  address?: string;
}

export const authService = {
  /**
   * Creates the account. With `signIn: false` the returned token is thrown
   * away, for flows (partner registration) where the person logs in next.
   */
  async register(input: RegisterInput, opts: { signIn?: boolean; remember?: boolean } = {}): Promise<User> {
    const { signIn = true, remember = true } = opts;
    // Role-specific endpoint: /auth/customer/register or /auth/partner/register
    const role = input.role ?? "customer";
    const { data } = await api.post<{ user: User; token?: string }>(`/auth/${role}/register`, input);
    if (signIn && data.token) tokenStore.set(data.token, remember);
    return data.user;
  },

  /** Logs in through the role's own endpoint: /auth/customer|partner|admin/login. */
  async login(email: string, password: string, remember = true, role: Role = "customer"): Promise<User> {
    const { data } = await api.post<{ user: User; token: string }>(`/auth/${role}/login`, { email, password });
    tokenStore.set(data.token, remember);
    return data.user;
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>("/auth/me");
    return data.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      tokenStore.clear();
    }
  },

  /** True when a token is stored. The server still decides whether it is valid. */
  hasToken(): boolean {
    return !!tokenStore.get();
  },
};
