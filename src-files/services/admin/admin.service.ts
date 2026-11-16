import { apiAdminAuth } from "./api-repository";
import type { AdminAuthRepository } from "./contracts";

/** Admin authentication. Separate from src/services/auth (customers) and src/services/partner-auth. */
const repo: AdminAuthRepository = apiAdminAuth;

export const loginAdmin: AdminAuthRepository["loginAdmin"] = (input) => repo.loginAdmin(input);
export const getAdmin: AdminAuthRepository["getAdmin"] = () => repo.getAdmin();
export const logoutAdmin: AdminAuthRepository["logoutAdmin"] = () => repo.logoutAdmin();
