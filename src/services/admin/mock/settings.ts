import { validateSettings } from "@/features/admin/settings";
import { delay } from "@/lib/browser-storage";
import { ServiceError } from "@/services/errors";
import type { AdminSettingsRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { readSettings, saveSettings } from "./store";

export const mockAdminSettings: AdminSettingsRepository = {
  async getSettings() {
    await delay(250);
    requireMockAdminSession();
    return readSettings();
  },

  async updateSettings(input) {
    await delay(400);
    requireMockAdminSession();
    const errors = validateSettings(input);
    const [field, message] = Object.entries(errors).find(([, m]) => m) ?? [];
    if (field && message) throw new ServiceError("invalid_input", message, field);
    return saveSettings({
      ...input,
      platformName: input.platformName.trim(),
      contactEmail: input.contactEmail.trim().toLowerCase(),
      contactPhone: input.contactPhone.trim(),
    });
  },
};
