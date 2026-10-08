import { httpAdminAuth } from "./http";
import { mockAdminAuth } from "./mock/auth";
import { isAdminApi } from "./source";
import type { AdminAuthRepository } from "./contracts";

/** Admin authentication. Separate from src/services/auth (customers) and src/services/partner-auth. */
const repo: AdminAuthRepository = isAdminApi ? httpAdminAuth : mockAdminAuth;

export const loginAdmin: AdminAuthRepository["loginAdmin"] = (input) => repo.loginAdmin(input);
export const getAdmin: AdminAuthRepository["getAdmin"] = () => repo.getAdmin();
export const logoutAdmin: AdminAuthRepository["logoutAdmin"] = () => repo.logoutAdmin();
