/**
 * Safe wrappers over localStorage / sessionStorage. Used only by the mock
 * repositories; the real API keeps its state in PostgreSQL and a session cookie.
 * Storage can be missing or throw (private windows, blocked cookies, SSR), so
 * every call is guarded and callers fall back to in-memory defaults.
 */
type Area = "local" | "session";

const get = (area: Area): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return area === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export function readJson<T>(key: string, fallback: T, area: Area = "local"): T {
  try {
    const raw = get(area)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, area: Area = "local"): void {
  try {
    get(area)?.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or blocked storage: the mock simply will not persist */
  }
}

export function removeKey(key: string, area: Area = "local"): void {
  try {
    get(area)?.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Simulated network latency so loading states are visible in mock mode. */
export const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));
