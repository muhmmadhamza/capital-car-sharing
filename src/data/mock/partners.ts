import type { Partner } from "@/types/partner";

/** Mock-only: the account record includes a password. The real API never returns one. */
export interface MockPartnerAccount extends Partner {
  password: string;
}

export const DEMO_PARTNER_CREDENTIALS = { email: "partner@capitalcarsharing.example", password: "Partner123!" } as const;

export const DEMO_PARTNER_ID = "partner_demo";

export const seedPartnerAccounts: MockPartnerAccount[] = [
  {
    id: DEMO_PARTNER_ID,
    name: "Daniel Reed",
    companyName: "Reed Prestige Rentals",
    email: DEMO_PARTNER_CREDENTIALS.email,
    phone: "+1 555 020 9182",
    address: "27 Harbour Road, Capital City",
    createdAt: "2025-09-03T08:15:00.000Z",
    password: DEMO_PARTNER_CREDENTIALS.password,
  },
];
