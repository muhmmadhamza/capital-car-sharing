"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertIcon, EyeIcon, EyeOffIcon } from "./Icons";

export const inputClass =
  "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink placeholder:text-muted/80 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60 disabled:bg-navy-900/5 disabled:text-muted";

type Props = Omit<ComponentProps<"input">, "className"> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Adds a show/hide button for password inputs. */
  revealable?: boolean;
  className?: string;
};

/** Label + input + error in one accessible unit. Error text is linked with aria-describedby. */
export function FormField({ label, error, hint, revealable, className, id, type = "text", ...input }: Props) {
  const auto = useId();
  const fieldId = id ?? auto;
  const describedBy = [error ? `${fieldId}-error` : null, hint ? `${fieldId}-hint` : null].filter(Boolean).join(" ") || undefined;
  const [shown, setShown] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      <div className="relative">
        <input
          {...input}
          id={fieldId}
          type={isPassword && shown ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, error ? "border-[#B3261E]/60" : "border-navy-900/20", revealable && isPassword && "pr-11")}
        />
        {revealable && isPassword ? (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-navy-700 hover:bg-navy-900/5 hover:text-navy-900"
          >
            {shown ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-[#8E1D17]">
          <AlertIcon width={14} height={14} className="mt-px shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level error banner, matching the one on the reserve page. */
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-4 py-3 text-sm text-[#8E1D17]">
      <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
