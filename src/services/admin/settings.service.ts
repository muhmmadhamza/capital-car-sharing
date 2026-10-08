import { httpAdminSettings } from "./http";
import { mockAdminSettings } from "./mock/settings";
import { isAdminApi } from "./source";
import type { AdminSettingsRepository } from "./contracts";

const repo: AdminSettingsRepository = isAdminApi ? httpAdminSettings : mockAdminSettings;

export const getSettings: AdminSettingsRepository["getSettings"] = () => repo.getSettings();
export const updateSettings: AdminSettingsRepository["updateSettings"] = (input) => repo.updateSettings(input);
