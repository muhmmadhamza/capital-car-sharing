import { siteConfig } from "@/config/site";

/** "12 Oct 2026, 14:05" for an ISO timestamp, in the site's locale and UTC like the rest of the app. */
export const formatIsoDateTime = (iso: string) =>
  new Intl.DateTimeFormat(siteConfig.locale, { timeZone: "UTC", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );

/** "5 minutes ago", "3 days ago", or the date once it is more than a month old. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 31) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatIsoDateTime(iso).split(",")[0];
}

/** "BMW 3 Series 2023" */
export const carLabel = (car: { make: string; model: string; year: number }) => `${car.make} ${car.model} ${car.year}`;
