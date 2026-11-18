import { tokenStore } from "@/lib/api-client";
import { authService as api } from "../api/auth.service";
import { customerService } from "../api/customer.service";
import { guard, isServiceError, ServiceError, toLoginError, toServiceError, unavailable } from "../errors";
import { mapCustomer } from "../mappers/customer";
import type { AuthRepository } from "./repository";

const NOT_CUSTOMER = "This is not a customer account. Use the partner or admin log in instead.";

/** True for "nobody is signed in here" answers, which are not errors. */
const isSignedOut = (e: unknown) => isServiceError(e) && (e.code === "unauthenticated" || e.code === "forbidden");

export const apiAuthRepository: AuthRepository = {
  async getSession() {
    if (!api.hasToken()) return null;
    try {
      const user = await api.me();
      return user.role === "customer" ? mapCustomer(user) : null;
    } catch (e) {
      const err = toServiceError(e);
      if (isSignedOut(err)) return null;
      throw err;
    }
  },

  async register(input) {
    const user = await guard(() => api.register({ name: input.name, email: input.email, phone: input.phone, password: input.password, role: "customer" }));
    return mapCustomer(user);
  },

  async login(input) {
    let user;
    try {
      user = await api.login(input.email, input.password, input.remember, "customer");
    } catch (e) {
      throw toLoginError(e);
    }
    if (user.role !== "customer") {
      tokenStore.clear();
      throw new ServiceError("invalid_credentials", NOT_CUSTOMER);
    }
    return mapCustomer(user);
  },

  async logout() {
    // The token is dropped locally even when the server cannot be reached.
    await api.logout().catch(() => undefined);
  },

  async updateProfile(input) {
    const current = await guard(() => api.me());
    if (input.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      throw new ServiceError("invalid_input", "Changing your email address isn't supported yet.", "email");
    }
    const updated = await guard(() => customerService.updateProfile({ name: input.name.trim(), phone: input.phone.trim(), avatar: input.avatar }));
    return mapCustomer(updated);
  },

  async uploadAvatar() {
    return unavailable("Uploading a profile photo");
  },
};
