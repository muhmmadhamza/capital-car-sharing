import { api } from "@/lib/api-client";
import { guard } from "@/services/errors";

type Role = "customer" | "partner";

/**
 * Forgot/reset password for customers and partners, backed by the real API (admins have their own in
 * services/admin). The server never reveals whether an email has an account.
 */
function passwordReset(role: Role) {
  return {
    async request(email: string): Promise<string> {
      const { data } = await guard(() => api.post<{ message: string }>(`/auth/${role}/forgot-password`, { email: email.trim() }));
      return data.message;
    },
    async reset(token: string, password: string): Promise<string> {
      const { data } = await guard(() => api.post<{ message: string }>(`/auth/${role}/reset-password`, { token, password }));
      return data.message;
    },
  };
}

export const customerPasswordReset = passwordReset("customer");
export const partnerPasswordReset = passwordReset("partner");
