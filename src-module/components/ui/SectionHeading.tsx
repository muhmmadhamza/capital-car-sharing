import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Left-aligned section title with an optional supporting sentence. */
export function SectionHeading({
  title,
  children,
  tone = "light",
  className,
}: {
  title: string;
  children?: ReactNode;
  /** "light" = on a white/grey background, "dark" = on navy. */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2
        className={cn(
          "text-3xl font-semibold leading-tight tracking-tight sm:text-4xl",
          tone === "dark" ? "text-white" : "text-navy-900",
        )}
      >
        {title}
      </h2>
      {children ? (
        <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "dark" ? "text-navy-100" : "text-muted")}>
          {children}
        </p>
      ) : null}
    </div>
  );
}
