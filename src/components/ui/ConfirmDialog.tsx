"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Small confirmation modal for destructive actions. Focus starts on the safe
 * button, Escape and the backdrop cancel, and the page behind cannot scroll.
 */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel = "Keep it",
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Latest values for the keyboard handler, so the effect below runs once per open.
  const latest = useRef({ busy, onCancel });
  latest.current = { busy, onCancel };

  useEffect(() => {
    cancelRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.busy) latest.current.onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-navy-950/60" onClick={busy ? undefined : onCancel} aria-hidden="true" />
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-[#B3261E]" />
        <h2 id="confirm-title" className="text-lg font-semibold text-navy-900">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-navy-700">{children}</div>
        {error ? (
          <p role="alert" className="mt-4 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-4 py-3 text-sm text-[#8E1D17]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-navy-900/30 px-5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900/5 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#B3261E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8E1D17] disabled:opacity-60"
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
