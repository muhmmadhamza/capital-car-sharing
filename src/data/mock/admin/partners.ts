import type { AdminPartner } from "@/types/admin";
import { ago } from "./time";

/** Seed partners. partner_demo is the same business as the demo account in the partner area. */
export const adminPartners: AdminPartner[] = [
  { id: "partner_demo", name: "Daniel Reed", companyName: "Reed Prestige Rentals", email: "partner@capitalcarsharing.example", phone: "+1 555 020 9182", status: "active", createdAt: "2025-09-03T08:15:00.000Z" },
  { id: "ptn_102", name: "Elena Marković", companyName: "Marković Auto Group", email: "elena@markovic-auto.example", phone: "+1 555 020 4410", status: "active", createdAt: ago(340) },
  { id: "ptn_103", name: "Samuel Adeyemi", companyName: "Lagoon Motors", email: "samuel@lagoonmotors.example", phone: "+1 555 020 7753", status: "active", createdAt: ago(300) },
  { id: "ptn_104", name: "Hannah Frost", companyName: "Frost & Daughters Hire", email: "hannah@frostdaughters.example", phone: "+1 555 020 3126", status: "active", createdAt: ago(260) },
  { id: "ptn_105", name: "Rohan Mehta", companyName: "Metro Drive Fleet", email: "rohan@metrodrive.example", phone: "+1 555 020 8890", status: "active", createdAt: ago(200) },
  { id: "ptn_106", name: "Claire Dubois", companyName: "Dubois Classic Cars", email: "claire@duboisclassics.example", phone: "+1 555 020 1572", status: "pending", createdAt: ago(2) },
  { id: "ptn_107", name: "Viktor Novak", companyName: "Novak Mobility", email: "viktor@novakmobility.example", phone: "+1 555 020 6604", status: "pending", createdAt: ago(0.4) },
  { id: "ptn_108", name: "Layla Haddad", companyName: "Haddad Premier Cars", email: "layla@haddadpremier.example", phone: "+1 555 020 2945", status: "suspended", createdAt: ago(280) },
];
