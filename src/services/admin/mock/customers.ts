import { delay } from "@/lib/browser-storage";
import { ServiceError } from "@/services/errors";
import type { AdminCustomerRepository } from "../contracts";
import { requireMockAdminSession } from "./auth";
import { byNewestPickup, customerRows, normaliseEmail, reservationViews, saveCustomerPatch, allCustomers } from "./store";

const rowFor = (id: string) => {
  const row = customerRows().find((c) => c.id === id);
  if (!row) throw new ServiceError("not_found", "That customer no longer exists.");
  return row;
};

export const mockAdminCustomers: AdminCustomerRepository = {
  async getCustomers() {
    await delay(350);
    requireMockAdminSession();
    return customerRows().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getCustomerById(id) {
    await delay(250);
    requireMockAdminSession();
    const row = customerRows().find((c) => c.id === id);
    if (!row) return null;
    return { ...row, reservations: reservationViews().filter((r) => r.customerId === id).sort(byNewestPickup) };
  },

  async updateCustomer(id, input) {
    await delay(300);
    requireMockAdminSession();
    const email = normaliseEmail(input.email);
    if (allCustomers().some((c) => c.id !== id && normaliseEmail(c.email) === email)) {
      throw new ServiceError("email_taken", "Another customer already uses this email.", "email");
    }
    saveCustomerPatch(id, { name: input.name.trim(), email, phone: input.phone.trim() });
    return rowFor(id);
  },

  async updateCustomerStatus(id, status) {
    await delay(150);
    requireMockAdminSession();
    saveCustomerPatch(id, { status });
    return rowFor(id);
  },
};
