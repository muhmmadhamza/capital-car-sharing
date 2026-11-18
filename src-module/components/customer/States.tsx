import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export const panel = "rounded-2xl border border-navy-900/10 bg-white shadow-card";

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-navy-900/[0.07]", className)} />;
}

export function LoadingBlock({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
      ))}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className={cn(panel, "flex flex-col items-start gap-3 p-6")}>
      <p className="flex items-start gap-2 text-sm font-medium text-[#8E1D17]">
        <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
        {message}
      </p>
      {onRetry ? (
        <Button variant="outline-navy" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className={cn(panel, "flex flex-col items-center px-6 py-12 text-center")}>
      <span aria-hidden="true" className="mb-4 h-1 w-10 rounded-full bg-gold-500" />
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
