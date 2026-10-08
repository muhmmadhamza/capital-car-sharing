import type { Admin } from "@/types/admin";

/** Mock-only: the account record includes a password. The real API never returns one. */
export interface MockAdminAccount extends Admin {
  password: string;
}

export const DEMO_ADMIN_CREDENTIALS = { email: "admin@capitalcarsharing.example", password: "Admin123!" } as const;

export const seedAdminAccounts: MockAdminAccount[] = [
  {
    id: "admin_001",
    name: "Olivia Carter",
    email: DEMO_ADMIN_CREDENTIALS.email,
    role: "super_admin",
    password: DEMO_ADMIN_CREDENTIALS.password,
  },
  {
    id: "admin_002",
    name: "Noah Bennett",
    email: "support@capitalcarsharing.example",
    role: "support",
    password: "Support123!",
  },
];
