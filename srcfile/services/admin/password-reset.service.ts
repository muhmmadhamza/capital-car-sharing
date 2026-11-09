import { api } from "@/lib/api-client";
import { guard } from "@/services/errors";

/** Admin forgot/reset password, backed by the real API. The server never reveals whether an email exists. */
export const adminPasswordReset = {
  async request(email: string): Promise<string> {
    const { data } = await guard(() =>
      api.post<{ message: string }>("/auth/admin/forgot-password", { email: email.trim() }),
    );
    return data.message;
  },

  async reset(token: string, password: string): Promise<string> {
    const { data } = await guard(() => api.post<{ message: string }>("/auth/admin/reset-password", { token, password }));
    return data.message;
  },
};
