import { tokenStore } from "@/lib/api-client";
import { authService as api } from "../api/auth.service";
import { partnerService } from "../api/partner.service";
import { guard, isServiceError, ServiceError, toLoginError, toServiceError, unavailable } from "../errors";
import { mapPartner, mapPartnerFromUser } from "../mappers/partner";
import type { PartnerAuthRepository } from "./repository";

const NOT_PARTNER = "This is not a partner account. Use the customer or admin log in instead.";

const isSignedOut = (e: unknown) => isServiceError(e) && (e.code === "unauthenticated" || e.code === "forbidden");

export const apiPartnerAuthRepository: PartnerAuthRepository = {
  async getSession() {
    if (!api.hasToken()) return null;
    try {
      return mapPartner(await partnerService.getProfile());
    } catch (e) {
      const err = toServiceError(e);
      if (isSignedOut(err)) return null;
      throw err;
    }
  },

  async register(input) {
    // The person logs in next, so the token the API returns is not kept.
    const user = await guard(() =>
      api.register(
        { name: input.name, email: input.email, phone: input.phone, password: input.password, role: "partner", companyName: input.companyName, address: input.address },
        { signIn: false },
      ),
    );
    return mapPartnerFromUser(user, { companyName: input.companyName, address: input.address });
  },

  async login(input) {
    let user;
    try {
      user = await api.login(input.email, input.password, input.remember, "partner");
    } catch (e) {
      throw toLoginError(e);
    }
    if (user.role !== "partner") {
      tokenStore.clear();
      throw new ServiceError("invalid_credentials", NOT_PARTNER);
    }
    try {
      return mapPartner(await partnerService.getProfile());
    } catch (e) {
      tokenStore.clear();
      throw toServiceError(e);
    }
  },

  async logout() {
    await api.logout().catch(() => undefined);
  },

  async updateProfile(input) {
    const current = await guard(() => partnerService.getProfile());
    if (current.email && input.email.trim().toLowerCase() !== current.email.toLowerCase()) {
      throw new ServiceError("invalid_input", "Changing your email address isn't supported yet.", "email");
    }
    await guard(() =>
      partnerService.updateProfile({ name: input.name.trim(), phone: input.phone.trim(), companyName: input.companyName.trim(), address: input.address.trim(), avatar: input.avatar }),
    );
    // Read the profile back so the screen shows exactly what the server stored.
    return mapPartner(await guard(() => partnerService.getProfile()));
  },

  async uploadAvatar() {
    return unavailable("Uploading a profile photo");
  },
};
