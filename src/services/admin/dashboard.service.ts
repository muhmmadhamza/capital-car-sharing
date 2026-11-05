import { apiAdminDashboard } from "./api-repository";
import type { AdminDashboardRepository } from "./contracts";

const repo: AdminDashboardRepository = apiAdminDashboard;

export const getDashboard: AdminDashboardRepository["getDashboard"] = () => repo.getDashboard();
