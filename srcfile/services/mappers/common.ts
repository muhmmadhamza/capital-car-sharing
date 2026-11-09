import type { DateKey, WallClock } from "@/types/booking";

/** "Model S Plaid" -> "model-s-plaid" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Numeric API ids are strings everywhere in the UI. */
export const idOf = (id: number | string): string => String(id);

/** "42" -> 42. Anything that is not a whole number is rejected, so a bad URL never reaches the API. */
export function numericId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

/** The API returns dates as "2026-10-12" or full ISO timestamps. Both become "2026-10-12". */
export function toDateKey(value: string): DateKey {
  return value.slice(0, 10);
}

/**
 * Reservations come back as dates without a time of day. The UI works in wall-clock
 * strings, so a date becomes midnight of that day; midnight is shown as a date only.
 */
export function toWallClock(value: string): WallClock {
  return value.length > 10 && value[10] !== " " ? `${value.slice(0, 10)}T${value.slice(11, 16)}` : `${value.slice(0, 10)}T00:00`;
}

export const orEmpty = (value: string | null | undefined): string => value ?? "";

/** Decorative colours for the placeholder illustration. Not business data. */
const PAINTS = ["#E9EDF4", "#7C8DA8", "#2B3A55", "#C9CED8", "#8E1D17", "#1E6B45"];
export function paintFor(id: string): string {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PAINTS[h % PAINTS.length];
}
