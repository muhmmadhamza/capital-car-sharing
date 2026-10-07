import type { DateKey, TimeKey, WallClock } from "@/types/booking";
import { siteConfig } from "@/config/site";

/**
 * Wall-clock date helpers. A WallClock string ("2026-10-12T14:00") is parsed
 * as if it were UTC and formatted in UTC again, so results never depend on the
 * machine's time zone or daylight-saving changes.
 */

const WALL_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DAY_MS = 86_400_000;

export const isWallClock = (v: unknown): v is WallClock =>
  typeof v === "string" && WALL_RE.test(v) && !Number.isNaN(parseWall(v).getTime());
export const isDateKey = (v: unknown): v is DateKey =>
  typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
export const isTimeKey = (v: unknown): v is TimeKey => typeof v === "string" && TIME_RE.test(v);

export function parseWall(value: WallClock): Date {
  return new Date(`${value}:00Z`);
}

export function toWall(date: Date): WallClock {
  return date.toISOString().slice(0, 16);
}

export const dateOf = (value: WallClock): DateKey => value.slice(0, 10);
export const timeOf = (value: WallClock): TimeKey => value.slice(11, 16);
export const combine = (date: DateKey, time: TimeKey): WallClock => `${date}T${time}`;

/** Current wall-clock time in the site's operating time zone. */
export function nowWall(timeZone: string = siteConfig.timeZone): WallClock {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function addDays(value: WallClock | DateKey, days: number): typeof value {
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : `${value}:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return value.length === 10 ? d.toISOString().slice(0, 10) : toWall(d);
}

export function addMonths(date: DateKey, months: number): DateKey {
  const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function diffHours(from: WallClock, to: WallClock): number {
  return (parseWall(to).getTime() - parseWall(from).getTime()) / 3_600_000;
}

/** Billable days: every started 24 hours counts as a day, minimum one. */
export function rentalDays(pickup: WallClock, ret: WallClock): number {
  const ms = parseWall(ret).getTime() - parseWall(pickup).getTime();
  return Math.max(1, Math.ceil(ms / DAY_MS));
}

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", ...options });

export const formatDate = (value: WallClock | DateKey) =>
  fmt({ day: "numeric", month: "short", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T00:00:00Z` : `${value}:00Z`));

export const formatShortDate = (value: WallClock | DateKey) =>
  fmt({ day: "numeric", month: "short" }).format(new Date(value.length === 10 ? `${value}T00:00:00Z` : `${value}:00Z`));

export const formatTime = (value: WallClock) => fmt({ hour: "numeric", minute: "2-digit" }).format(parseWall(value));

export const formatDateTime = (value: WallClock) => `${formatShortDate(value)}, ${formatTime(value)}`;

export const formatMonth = (date: DateKey) =>
  fmt({ month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00Z`));

/** 12-hour label for a "HH:mm" value. */
export function formatTimeKey(time: TimeKey): string {
  return formatTime(`1970-01-01T${time}`);
}

/** Half-hour slots for time pickers: "00:00" … "23:30". */
export const TIME_SLOTS: TimeKey[] = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  return `${h}:${i % 2 ? "30" : "00"}`;
});

/** Weekday index with Monday = 0. */
export function weekdayMon0(date: DateKey): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
}

export function daysInMonth(date: DateKey): number {
  const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1, 0);
  return d.getUTCDate();
}
