"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertIcon } from "./Icons";
import { inputClass } from "./FormField";

type Shared = { label: string; error?: string; hint?: ReactNode; className?: string };

function Wrapper({ id, label, error, hint, className, children }: Shared & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-[#8E1D17]">
          <AlertIcon width={14} height={14} className="mt-px shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const describe = (id: string, error?: string, hint?: ReactNode) =>
  [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;

/** Native select styled like FormField. */
export function SelectField({
  label,
  error,
  hint,
  className,
  id,
  children,
  ...select
}: Shared & Omit<ComponentProps<"select">, "className">) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={className}>
      <select
        {...select}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(fieldId, error, hint)}
        className={cn(inputClass, "appearance-none bg-[length:1rem] bg-[right_0.875rem_center] bg-no-repeat pr-10", error ? "border-[#B3261E]/60" : "border-navy-900/20")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231F3A63' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export function TextareaField({ label, error, hint, className, id, ...area }: Shared & Omit<ComponentProps<"textarea">, "className">) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <Wrapper id={fieldId} label={label} error={error} hint={hint} className={className}>
      <textarea
        {...area}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe(fieldId, error, hint)}
        className={cn(inputClass, "h-auto min-h-28 py-2.5 leading-relaxed", error ? "border-[#B3261E]/60" : "border-navy-900/20")}
      />
    </Wrapper>
  );
}
