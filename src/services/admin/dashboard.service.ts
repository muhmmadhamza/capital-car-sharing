import { httpAdminDashboard } from "./http";
import { mockAdminDashboard } from "./mock/dashboard";
import { isAdminApi } from "./source";
import type { AdminDashboardRepository } from "./contracts";

const repo: AdminDashboardRepository = isAdminApi ? httpAdminDashboard : mockAdminDashboard;

export const getDashboard: AdminDashboardRepository["getDashboard"] = () => repo.getDashboard();
