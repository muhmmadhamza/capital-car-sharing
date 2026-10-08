import { seedAdminAccounts, type MockAdminAccount } from "@/data/mock/admin/admins";
import { delay, readJson, removeKey, writeJson } from "@/lib/browser-storage";
import type { Admin } from "@/types/admin";
import { ServiceError } from "@/services/errors";
import type { AdminAuthRepository } from "../contracts";

/**
 * Browser-only mock. Uses its own storage key, so a customer or partner
 * session never counts as an admin session and the other way round.
 * Passwords are plain text here ONLY because this is a stand-in with no real
 * users; the API must hash them and never ship an account list to the browser.
 */
const SESSION_KEY = "ccs.mock.admin.session";

type StoredSession = { adminId: string };

const toAdmin = ({ password: _password, ...admin }: MockAdminAccount): Admin => admin;

function sessionId(): string | null {
  const session = readJson<StoredSession | null>(SESSION_KEY, null, "local") ?? readJson<StoredSession | null>(SESSION_KEY, null, "session");
  return session?.adminId ?? null;
}

const clearSession = () => {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
};

export const mockAdminAuth: AdminAuthRepository = {
  async loginAdmin({ email, password, remember }) {
    await delay();
    const account = seedAdminAccounts.find((a) => a.email === email.trim().toLowerCase());
    if (!account || account.password !== password) {
      throw new ServiceError("invalid_credentials", "Incorrect email or password.");
    }
    clearSession();
    writeJson(SESSION_KEY, { adminId: account.id } satisfies StoredSession, remember ? "local" : "session");
    return toAdmin(account);
  },

  async getAdmin() {
    await delay(120);
    const id = sessionId();
    const account = id ? seedAdminAccounts.find((a) => a.id === id) : undefined;
    return account ? toAdmin(account) : null;
  },

  async logoutAdmin() {
    await delay(80);
    clearSession();
  },
};

/** Used by the other mock repositories so data calls also refuse to run without an admin session. */
export function requireMockAdminSession(): void {
  if (!sessionId()) throw new ServiceError("unauthenticated", "Please sign in again.");
}
