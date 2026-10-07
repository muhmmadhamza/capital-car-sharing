import { seedAccounts, type MockAccount } from "@/data/mock/customers";
import { delay, readJson, removeKey, writeJson } from "@/lib/browser-storage";
import type { Customer } from "@/types/customer";
import { ServiceError } from "../errors";
import type { AuthRepository } from "./repository";

/**
 * Browser-only mock. Accounts live in localStorage and the session in
 * localStorage ("remember me") or sessionStorage (until the tab closes).
 * Passwords are kept in plain text here ONLY because this is a stand-in with
 * no real users; the API must hash them.
 */
const ACCOUNTS_KEY = "ccs.mock.accounts";
const SESSION_KEY = "ccs.mock.session";

export const MOCK_SESSION_KEY = SESSION_KEY;

type StoredSession = { customerId: string };

const normalise = (email: string) => email.trim().toLowerCase();

function loadAccounts(): MockAccount[] {
  const stored = readJson<MockAccount[]>(ACCOUNTS_KEY, []);
  // The demo account is always available, even if storage was cleared.
  const missing = seedAccounts.filter((s) => !stored.some((a) => a.id === s.id));
  return [...missing, ...stored];
}

const saveAccounts = (accounts: MockAccount[]) => writeJson(ACCOUNTS_KEY, accounts);

/** Strip the password before anything leaves the repository. */
const toCustomer = ({ password: _password, ...customer }: MockAccount): Customer => customer;

export function getMockSessionCustomerId(): string | null {
  const session =
    readJson<StoredSession | null>(SESSION_KEY, null, "local") ?? readJson<StoredSession | null>(SESSION_KEY, null, "session");
  return session?.customerId ?? null;
}

function startSession(customerId: string, remember: boolean) {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  writeJson(SESSION_KEY, { customerId } satisfies StoredSession, remember ? "local" : "session");
}

export const mockAuthRepository: AuthRepository = {
  async getSession() {
    await delay(120);
    const id = getMockSessionCustomerId();
    const account = id ? loadAccounts().find((a) => a.id === id) : undefined;
    return account ? toCustomer(account) : null;
  },

  async register(input) {
    await delay();
    const accounts = loadAccounts();
    const email = normalise(input.email);
    if (accounts.some((a) => a.email === email)) {
      throw new ServiceError("email_taken", "An account with this email already exists.", "email");
    }
    const account: MockAccount = {
      id: `cust_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      createdAt: new Date().toISOString(),
      password: input.password,
    };
    saveAccounts([...accounts, account]);
    startSession(account.id, false);
    return toCustomer(account);
  },

  async login({ email, password, remember }) {
    await delay();
    const account = loadAccounts().find((a) => a.email === normalise(email));
    if (!account || account.password !== password) {
      throw new ServiceError("invalid_credentials", "Incorrect email or password.");
    }
    startSession(account.id, remember);
    return toCustomer(account);
  },

  async logout() {
    await delay(80);
    removeKey(SESSION_KEY, "local");
    removeKey(SESSION_KEY, "session");
  },

  async updateProfile(input) {
    await delay();
    const id = getMockSessionCustomerId();
    const accounts = loadAccounts();
    const current = accounts.find((a) => a.id === id);
    if (!current) throw new ServiceError("unauthenticated", "Please sign in again.");

    const email = normalise(input.email);
    if (accounts.some((a) => a.id !== current.id && a.email === email)) {
      throw new ServiceError("email_taken", "Another account already uses this email.", "email");
    }
    const updated: MockAccount = {
      ...current,
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      avatar: input.avatar === undefined ? current.avatar : input.avatar ?? undefined,
    };
    saveAccounts(accounts.map((a) => (a.id === updated.id ? updated : a)));
    return toCustomer(updated);
  },

  /** Mock: shrink to a small square data URL so it fits in localStorage. */
  async uploadAvatar(file) {
    if (!file.type.startsWith("image/")) {
      throw new ServiceError("invalid_input", "Please choose an image file.", "avatar");
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new ServiceError("invalid_input", "That image is too large. Choose one under 8 MB.", "avatar");
    }
    const bitmap = await createImageBitmap(file).catch(() => null);
    if (!bitmap) throw new ServiceError("invalid_input", "We could not read that image.", "avatar");
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ServiceError("invalid_input", "We could not read that image.", "avatar");
    const side = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.85);
  },
};
