import type { AdminCustomer } from "@/types/admin";
import { ago } from "./time";

/** Seed customers. cust_demo is the same person as the demo account in the customer area. */
export const adminCustomers: AdminCustomer[] = [
  { id: "cust_demo", name: "Amelia Hart", email: "demo@capitalcarsharing.example", phone: "+1 555 010 4477", status: "active", createdAt: "2025-11-14T09:30:00.000Z" },
  { id: "cust_201", name: "Marcus Webb", email: "marcus.webb@example.com", phone: "+1 555 010 2231", status: "active", createdAt: ago(200) },
  { id: "cust_202", name: "Priya Nair", email: "priya.nair@example.com", phone: "+1 555 010 8842", status: "active", createdAt: ago(170) },
  { id: "cust_203", name: "Tomás Herrera", email: "tomas.herrera@example.com", phone: "+1 555 010 6615", status: "active", createdAt: ago(150) },
  { id: "cust_204", name: "Sofia Lindqvist", email: "sofia.lindqvist@example.com", phone: "+1 555 010 3390", status: "active", createdAt: ago(130) },
  { id: "cust_205", name: "James Okafor", email: "james.okafor@example.com", phone: "+1 555 010 7728", status: "inactive", createdAt: ago(110) },
  { id: "cust_206", name: "Isabelle Laurent", email: "isabelle.laurent@example.com", phone: "+1 555 010 5104", status: "active", createdAt: ago(85) },
  { id: "cust_207", name: "Kenji Tanaka", email: "kenji.tanaka@example.com", phone: "+1 555 010 9271", status: "inactive", createdAt: ago(70) },
  { id: "cust_208", name: "Fatima Al-Sayed", email: "fatima.alsayed@example.com", phone: "+1 555 010 4863", status: "active", createdAt: ago(45) },
  { id: "cust_209", name: "Oliver Grant", email: "oliver.grant@example.com", phone: "+1 555 010 1957", status: "active", createdAt: ago(90) },
  { id: "cust_210", name: "Nadia Petrova", email: "nadia.petrova@example.com", phone: "+1 555 010 6038", status: "inactive", createdAt: ago(100) },
  { id: "cust_211", name: "Lucas Moreau", email: "lucas.moreau@example.com", phone: "+1 555 010 7415", status: "active", createdAt: ago(60) },
  { id: "cust_212", name: "Grace Mensah", email: "grace.mensah@example.com", phone: "+1 555 010 2689", status: "active", createdAt: ago(40) },
  { id: "cust_213", name: "Ethan Brooks", email: "ethan.brooks@example.com", phone: "+1 555 010 3342", status: "active", createdAt: ago(0.4) },
];
