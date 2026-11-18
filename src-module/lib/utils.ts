import { siteConfig } from "@/config/site";

/** Join class names, ignoring falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Exact amount for a price breakdown: whole amounts without decimals, otherwise cents ("$240", "$149.97"). */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** "Gulberg, Lahore" — skips the parts the API did not give us. */
export const formatLocation = (l: { name: string; city?: string }) => [l.name, l.city].filter(Boolean).join(", ");
