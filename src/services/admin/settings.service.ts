import { apiAdminSettings } from "./api-repository";
import type { AdminSettingsRepository } from "./contracts";

const repo: AdminSettingsRepository = apiAdminSettings;

export const getSettings: AdminSettingsRepository["getSettings"] = () => repo.getSettings();
export const updateSettings: AdminSettingsRepository["updateSettings"] = (input) => repo.updateSettings(input);
