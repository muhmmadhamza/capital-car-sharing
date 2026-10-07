import type { Customer } from "@/types/customer";

/** Mock-only: the account record includes a password. The real API never returns one. */
export interface MockAccount extends Customer {
  password: string;
}

export const DEMO_CREDENTIALS = { email: "demo@capitalcarsharing.example", password: "Demo1234!" } as const;

export const DEMO_CUSTOMER_ID = "cust_demo";

export const seedAccounts: MockAccount[] = [
  {
    id: DEMO_CUSTOMER_ID,
    name: "Amelia Hart",
    email: DEMO_CREDENTIALS.email,
    phone: "+1 555 010 4477",
    createdAt: "2025-11-14T09:30:00.000Z",
    password: DEMO_CREDENTIALS.password,
  },
];
