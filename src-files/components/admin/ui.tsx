"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/Icons";
import type { Tone } from "@/features/admin/status";
import { cn } from "@/lib/utils";
import { MoreIcon } from "./AdminIcons";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

export const panel = "rounded-2xl border border-navy-900/10 bg-white shadow-card";

// ------------------------------------------------------------------ page header

export function PageHeader({ title, description, action, back }: { title: string; description?: string; action?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6 sm:mb-8">
      {back ? <div className="mb-3">{back}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span aria-hidden="true" className="mb-3 block h-1 w-10 rounded-full bg-gold-500" />
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
      </div>
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-9 items-center gap-1.5 rounded-md text-sm font-medium text-navy-700 transition-colors hover:text-navy-900">
      <ChevronLeftIcon width={16} height={16} />
      {children}
    </Link>
  );
}

// ----------------------------------------------------------------------- status

const pillStyles: Record<Tone, string> = {
  success: "border-[#1E6B45]/25 bg-[#E7F4EC] text-[#14543A]",
  gold: "border-gold-700/30 bg-gold-500/15 text-navy-900",
  navy: "border-navy-700/25 bg-navy-900/[0.06] text-navy-900",
  danger: "border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
};

const pillDots: Record<Tone, string> = {
  success: "bg-[#1E6B45]",
  gold: "bg-gold-700",
  navy: "bg-navy-700",
  danger: "bg-[#B3261E]",
};

/** Same pill shape and palette as the customer and partner status badges. */
export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold leading-snug", pillStyles[tone], className)}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", pillDots[tone])} />
      {children}
    </span>
  );
}

// ----------------------------------------------------------------- state blocks

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-navy-900/[0.07]", className)} />;
}

export function LoadingRows({ label, rows = 6 }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className={cn(panel, "space-y-3 p-5")}>
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
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

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span aria-hidden="true" className="mb-4 h-1 w-10 rounded-full bg-gold-500" />
      <h2 className="text-lg font-semibold text-navy-900">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

// -------------------------------------------------------------------- stat card

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: number | string;
  icon: IconType;
  href?: string;
  hint?: string;
}) {
  const body = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
        <Icon width={20} height={20} />
      </span>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight text-navy-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-navy-700">{label}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );
  const cls = cn(panel, "block p-5");
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-gold-500/60")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

// ------------------------------------------------------------------- pagination

export function Pagination({ page, pageCount, total, pageSize, onPage }: { page: number; pageCount: number; total: number; pageSize: number; onPage: (p: number) => void }) {
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn =
    "inline-flex h-10 items-center gap-1 rounded-lg border border-navy-900/20 px-3 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-navy-900/20 disabled:hover:bg-transparent";
  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 border-t border-navy-900/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeftIcon width={16} height={16} /> Previous
        </button>
        <span className="px-2 text-sm text-navy-700">
          Page {page} of {pageCount}
        </span>
        <button type="button" className={btn} disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          Next <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </nav>
  );
}

// ------------------------------------------------------------------ row actions

export interface RowAction {
  label: string;
  icon?: IconType;
  href?: string;
  onClick?: () => void;
  tone?: "default" | "danger";
}

const itemClass =
  "flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-left text-sm font-medium transition-colors focus-visible:bg-navy-900/5 focus-visible:outline-none";

/** A primary action button plus a "more" menu for the rest. Used on table rows and on mobile cards. */
export function RowActions({ name, primary, actions }: { name: string; primary: RowAction; actions: RowAction[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  function onMenuKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  const small =
    "inline-flex h-10 items-center justify-center rounded-lg border border-navy-900/25 px-3.5 text-sm font-semibold text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900/5";

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      {primary.href ? (
        <Link href={primary.href} className={small} aria-label={`${primary.label} ${name}`}>
          {primary.label}
        </Link>
      ) : (
        <button type="button" onClick={primary.onClick} className={small} aria-label={`${primary.label} ${name}`}>
          {primary.label}
        </button>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`More actions for ${name}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy-900/25 text-navy-900 transition-colors hover:border-navy-900 hover:bg-navy-900/5"
      >
        <MoreIcon width={18} height={18} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label={`Actions for ${name}`}
          onKeyDown={onMenuKey}
          className="absolute right-0 top-full z-30 mt-1.5 w-56 rounded-xl border border-navy-900/10 bg-white p-1.5 shadow-card ring-1 ring-navy-900/5"
        >
          {actions.map((a) => {
            const Icon = a.icon;
            const cls = cn(itemClass, a.tone === "danger" ? "text-[#8E1D17] hover:bg-[#FBEAE9]" : "text-navy-900 hover:bg-navy-900/5");
            const content = (
              <>
                {Icon ? <Icon width={18} height={18} className={a.tone === "danger" ? "text-[#B3261E]" : "text-gold-700"} /> : null}
                {a.label}
              </>
            );
            return a.href ? (
              <Link key={a.label} href={a.href} role="menuitem" className={cls} onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={a.label}
                type="button"
                role="menuitem"
                className={cls}
                onClick={() => {
                  setOpen(false);
                  a.onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------------ modal

/** Generic modal: Escape and the backdrop close it, focus moves inside, and the page behind cannot scroll. */
export function Modal({ title, description, onClose, busy, children }: { title: string; description?: string; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ busy, onClose });
  latest.current = { busy, onClose };

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])') ?? []).filter(
        (el) => !el.hasAttribute("disabled"),
      );
    (panelRef.current?.querySelector<HTMLElement>("input, select, textarea") ?? focusables()[0])?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !latest.current.busy) latest.current.onClose();
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-navy-950/60" onClick={busy ? undefined : onClose} aria-hidden="true" />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span aria-hidden="true" className="mb-3 block h-1 w-10 rounded-full bg-gold-500" />
            <h2 id={titleId} className="text-lg font-semibold text-navy-900">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-2 -mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-900/5 hover:text-navy-900 disabled:opacity-50"
          >
            <CloseIcon width={20} height={20} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------ toast

interface ToastState {
  id: number;
  message: string;
  tone: "success" | "error";
}

const ToastCtx = createContext<((message: string, tone?: "success" | "error") => void) | null>(null);

export function useAdminToast() {
  const notify = useContext(ToastCtx);
  if (!notify) throw new Error("useAdminToast must be used inside <AdminToastProvider>");
  return notify;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((message: string, tone: "success" | "error" = "success") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(undefined), 4500);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);
  const value = useMemo(() => notify, [notify]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4" role="status" aria-live="polite">
        {toast ? (
          <p
            key={toast.id}
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-card",
              toast.tone === "success" ? "bg-navy-900 text-white" : "border border-[#B3261E]/25 bg-[#FBEAE9] text-[#8E1D17]",
            )}
          >
            {toast.tone === "success" ? <CheckIcon width={18} height={18} className="mt-px shrink-0 text-gold-400" /> : <AlertIcon width={18} height={18} className="mt-px shrink-0" />}
            <span>{toast.message}</span>
          </p>
        ) : null}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------------------------------------------------------------- detail pieces

/** Label above a value, used in detail cards and mobile list cards. */
export function Meta({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-navy-900">{value}</dd>
    </div>
  );
}

/** After a detail page has loaded, scroll to the section named in the URL hash (e.g. #reservations). */
export function useScrollToHash(ready: boolean) {
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [ready]);
}

/** Outlined red button for destructive actions that open a confirmation. Matches Button's size and shape. */
export function DangerButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#B3261E]/40 px-5 text-sm font-semibold text-[#8E1D17] transition-colors hover:border-[#B3261E] hover:bg-[#FBEAE9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
