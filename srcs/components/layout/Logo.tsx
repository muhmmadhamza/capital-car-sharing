import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Open ring (a "C" and a steering wheel) with a hub dot, next to the wordmark. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <rect width="64" height="64" rx="14" fill="#C9A24B" />
      <path
        d="M44.5 21.5A17 17 0 1 0 44.5 42.5"
        fill="none"
        stroke="#0B1B33"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="33" cy="32" r="4" fill="#0B1B33" />
    </svg>
  );
}

export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label={`${siteConfig.name} home`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-lg font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-navy-900",
          )}
        >
          Capital
        </span>
        <span className={cn("mt-1 text-xs font-medium tracking-wide", tone === "light" ? "text-gold-400" : "text-gold-700")}>
          Car Sharing
        </span>
      </span>
    </Link>
  );
}
