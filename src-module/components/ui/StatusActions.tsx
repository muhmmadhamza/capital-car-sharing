"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormField";
import type { StatusAction } from "@/features/reservations/status";
import { errorMessage } from "@/services/errors";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/reservation";

/**
 * The next valid steps for a booking, as buttons. Actions that need a reason (rejecting, an admin cancelling) ask for
 * it first. The server checks every change again and its message is shown if it refuses (409 invalid transition,
 * 403 not allowed, 404 not yours), so a stale screen can never force a change.
 */
export function StatusActions({
  actions,
  onAct,
  note,
}: {
  actions: StatusAction[];
  onAct: (to: ReservationStatus, reason?: string) => Promise<void>;
  /** Shown instead of the buttons when there is nothing left to do. */
  note?: string;
}) {
  const [pending, setPending] = useState<StatusAction>();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (actions.length === 0) return note ? <p className="text-sm text-muted">{note}</p> : null;

  async function run(action: StatusAction, text?: string) {
    setBusy(true);
    setError(undefined);
    try {
      await onAct(action.to, text);
      setPending(undefined);
      setReason("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const trimmed = reason.trim();
  const reasonOk = trimmed.length >= 3 && trimmed.length <= 500;

  return (
    <div>
      {error ? <div className="mb-3"><FormAlert>{error}</FormAlert></div> : null}
      {pending ? (
        <div role="group" aria-label={pending.label} className="rounded-xl border border-navy-900/15 bg-navy-900/[0.03] p-4">
          <label htmlFor="status-reason" className="block text-sm font-semibold text-navy-900">
            Reason for “{pending.label}”
          </label>
          <p className="mt-0.5 text-xs text-muted">The customer will see this. 3 to 500 characters.</p>
          <textarea
            id="status-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            className="mt-2 w-full rounded-lg border border-navy-900/20 bg-white px-3 py-2 text-sm text-ink focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy || !reasonOk}
              onClick={() => run(pending, trimmed)}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#B3261E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#8E1D17] disabled:opacity-60"
            >
              {busy ? "Saving…" : `Confirm: ${pending.label}`}
            </button>
            <Button variant="outline-navy" onClick={() => { setPending(undefined); setError(undefined); }} disabled={busy}>
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
          {actions.map((a) =>
            a.danger ? (
              <button
                key={a.to}
                type="button"
                disabled={busy}
                onClick={() => (a.needsReason ? setPending(a) : run(a))}
                className={cn("inline-flex h-11 items-center justify-center rounded-lg border border-[#B3261E]/40 px-5 text-sm font-semibold text-[#8E1D17] transition-colors hover:bg-[#FBEAE9] disabled:opacity-60")}
              >
                {a.label}
              </button>
            ) : (
              <Button key={a.to} onClick={() => (a.needsReason ? setPending(a) : run(a))} disabled={busy} aria-busy={busy}>
                {busy ? "Saving…" : a.label}
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
