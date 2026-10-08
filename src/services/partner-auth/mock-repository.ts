import { seedPartnerAccounts, type MockPartnerAccount } from "@/data/mock/partners";
import { imageFileToDataUrl } from "@/lib/image";
import { delay, readJson, removeKey, writeJson } from "@/lib/browser-storage";
import type { Partner } from "@/types/partner";
import { ServiceError } from "../errors";
import type { PartnerAuthRepository } from "./repository";

/**
 * Browser-only mock. Uses its own storage keys, so a customer session and a
 * partner session never touch each other. Passwords are plain text here ONLY
 * because this is a stand-in with no real users; the API must hash them.
 */
const ACCOUNTS_KEY = "ccs.mock.partner.accounts";
const SESSION_KEY = "ccs.mock.partner.session";

type StoredSession = { partnerId: string };

const normalise = (email: string) => email.trim().toLowerCase();

function loadAccounts(): MockPartnerAccount[] {
  const stored = readJson<MockPartnerAccount[]>(ACCOUNTS_KEY, []);
  const missing = seedPartnerAccounts.filter((s) => !stored.some((a) => a.id === s.id));
  return [...missing, ...stored];
}

const saveAccounts = (accounts: MockPartnerAccount[]) => writeJson(ACCOUNTS_KEY, accounts);
const toPartner = ({ password: _password, ...partner }: MockPartnerAccount): Partner => partner;

export function getMockPartnerSessionId(): string | null {
  const session =
    readJson<StoredSession | null>(SESSION_KEY, null, "local") ?? readJson<StoredSession | null>(SESSION_KEY, null, "session");
  return session?.partnerId ?? null;
}

function startSession(partnerId: string, remember: boolean) {
  removeKey(SESSION_KEY, "local");
  removeKey(SESSION_KEY, "session");
  writeJson(SESSION_KEY, { partnerId } satisfies StoredSession, remember ? "local" : "session");
}

export const mockPartnerAuthRepository: PartnerAuthRepository = {
  async getSession() {
    await delay(120);
    const id = getMockPartnerSessionId();
    const account = id ? loadAccounts().find((a) => a.id === id) : undefined;
    return account ? toPartner(account) : null;
  },

  async register(input) {
    await delay();
    const accounts = loadAccounts();
    const email = normalise(input.email);
    if (accounts.some((a) => a.email === email)) {
      throw new ServiceError("email_taken", "A partner account with this email already exists.", "email");
    }
    const account: MockPartnerAccount = {
      id: `partner_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      companyName: input.companyName?.trim() || undefined,
      email,
      phone: input.phone.trim(),
      address: input.address.trim(),
      createdAt: new Date().toISOString(),
      password: input.password,
    };
    saveAccounts([...accounts, account]);
    return toPartner(account);
  },

  async login({ email, password, remember }) {
    await delay();
    const account = loadAccounts().find((a) => a.email === normalise(email));
    if (!account || account.password !== password) {
      throw new ServiceError("invalid_credentials", "Incorrect email or password.");
    }
    startSession(account.id, remember);
    return toPartner(account);
  },

  async logout() {
    await delay(80);
    removeKey(SESSION_KEY, "local");
    removeKey(SESSION_KEY, "session");
  },

  async updateProfile(input) {
    await delay();
    const id = getMockPartnerSessionId();
    const accounts = loadAccounts();
    const current = accounts.find((a) => a.id === id);
    if (!current) throw new ServiceError("unauthenticated", "Please sign in again.");

    const email = normalise(input.email);
    if (accounts.some((a) => a.id !== current.id && a.email === email)) {
      throw new ServiceError("email_taken", "Another partner account already uses this email.", "email");
    }
    const updated: MockPartnerAccount = {
      ...current,
      name: input.name.trim(),
      companyName: input.companyName.trim() || undefined,
      email,
      phone: input.phone.trim(),
      address: input.address.trim(),
      avatar: input.avatar === undefined ? current.avatar : (input.avatar ?? undefined),
    };
    saveAccounts(accounts.map((a) => (a.id === updated.id ? updated : a)));
    return toPartner(updated);
  },

  uploadAvatar: (file) => imageFileToDataUrl(file, { maxSide: 256, quality: 0.85, square: true, field: "avatar" }),
};
