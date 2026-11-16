import type { ReactNode } from "react";
import { AlertIcon } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

/**
 * Shown in place of data that could not be loaded (server down, wrong API
 * address, request refused). Same dashed card as the empty states, in the
 * error colour, so a failed load never looks like "there is nothing here".
 * Plain markup only, so server components can render it.
 */
export function ConnectionNotice({ message, title = "We couldn't load this right now", children, className }: { message?: string; title?: string; children?: ReactNode; className?: string }) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-dashed border-[#B3261E]/30 bg-white px-6 py-12 text-center", className)}>
      <AlertIcon width={22} height={22} className="mx-auto text-[#B3261E]" />
      <h3 className="mt-3 text-xl font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">{message ?? "Please check your connection and try again in a moment."}</p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}

/** Same card for "the server answered and there is simply nothing yet". */
export function EmptyNotice({ title, text, children, className }: { title: string; text: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-navy-900/20 bg-white px-6 py-14 text-center", className)}>
      <h3 className="text-xl font-semibold text-navy-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-muted">{text}</p>
      {children ? <div className="mt-6 flex justify-center">{children}</div> : null}
    </div>
  );
}
