"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AlertIcon, CloseIcon, ImageIcon } from "@/components/ui/Icons";
import { ACCEPT_ATTR, formatBytes } from "@/features/verification/validation";
import { cn } from "@/lib/utils";
import type { DocumentInfo } from "@/types/verification";

/**
 * One document side: click or drag a file in. Shows a preview (images), name and size, and a clear error.
 * `existing` is a file already on record (during a resubmission); picking a new file replaces it.
 */
export function FileUpload({
  label,
  hint,
  file,
  existing,
  error,
  disabled,
  onPick,
  onClear,
}: {
  label: string;
  hint: string;
  file: File | null;
  existing?: DocumentInfo;
  error?: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const choose = (f?: File) => {
    if (f && !disabled) onPick(f);
  };

  return (
    <div>
      <span id={`${id}-label`} className="mb-1.5 block text-sm font-medium text-navy-900">
        {label}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          choose(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed p-4 transition-colors",
          error ? "border-[#B3261E]/60 bg-[#FBEAE9]/40" : dragging ? "border-gold-500 bg-gold-500/10" : "border-navy-900/20 bg-navy-900/[0.02] hover:border-navy-900/40",
          disabled && "opacity-60",
        )}
      >
        <input
          ref={input}
          id={id}
          type="file"
          accept={ACCEPT_ATTR}
          disabled={disabled}
          className="sr-only"
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
          onChange={(e) => {
            choose(e.target.files?.[0]);
            e.target.value = ""; // picking the same file again must still fire onChange
          }}
        />
        {file ? (
          <div className="flex items-center gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-16 w-24 shrink-0 rounded-md border border-navy-900/10 object-cover" />
            ) : (
              <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-navy-900/10 bg-white text-xs font-semibold text-navy-700">PDF</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-900">{file.name}</p>
              <p className="text-xs text-muted">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              aria-label={`Remove ${label.toLowerCase()}`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-900/5 hover:text-navy-900"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-3 text-center sm:flex-row sm:text-left">
            <ImageIcon width={28} height={28} className="text-gold-700" />
            <div className="flex-1">
              <p className="text-sm text-navy-900">
                <button type="button" onClick={() => input.current?.click()} disabled={disabled} className="font-semibold underline underline-offset-2 hover:text-gold-700">
                  Choose a file
                </button>{" "}
                or drag it here
              </p>
              <p className="text-xs text-muted">{hint}</p>
              {existing ? <p className="mt-1 text-xs font-medium text-[#14543A]">A file is already on record. Leave this empty to keep it, or choose a new one to replace it.</p> : null}
            </div>
          </div>
        )}
      </div>
      <p id={`${id}-hint`} className="sr-only">
        {hint}
      </p>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-[#8E1D17]">
          <AlertIcon width={14} height={14} className="mt-px shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
