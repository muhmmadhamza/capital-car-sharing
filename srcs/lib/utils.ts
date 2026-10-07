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
