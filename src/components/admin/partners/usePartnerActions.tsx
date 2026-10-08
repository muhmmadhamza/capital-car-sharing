"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updatePartnerStatus } from "@/services/admin/partner.service";
import { errorMessage } from "@/services/errors";
import type { AdminPartnerRow, PartnerStatus } from "@/types/admin";
import { useAdminToast } from "../ui";

type Target = Pick<AdminPartnerRow, "id" | "name" | "companyName" | "status">;

const DONE: Record<PartnerStatus, (name: string) => string> = {
  active: (n) => `${n} is now active.`,
  suspended: (n) => `${n} has been suspended.`,
  pending: (n) => `${n} is now pending.`,
};

/**
 * Approve / suspend / activate flow shared by the partners list and the partner page.
 * The screen passes `apply`, which shows a change immediately; if the service fails the
 * hook calls it again with `undefined` so the screen can undo the change.
 */
export function usePartnerActions({ apply }: { apply: (id: string, patch: Partial<AdminPartnerRow> | undefined) => void }) {
  const notify = useAdminToast();
  const [confirming, setConfirming] = useState<Target>();

  async function setStatus(partner: Target, status: PartnerStatus) {
    apply(partner.id, { status });
    try {
      await updatePartnerStatus(partner.id, status);
      notify(status === "active" && partner.status === "pending" ? `${partner.companyName} has been approved.` : DONE[status](partner.companyName));
    } catch (err) {
      apply(partner.id, undefined);
      notify(errorMessage(err), "error");
    }
  }

  const dialogs: ReactNode = confirming ? (
    <ConfirmDialog
      title={`Suspend ${confirming.companyName}?`}
      confirmLabel="Suspend"
      cancelLabel="Cancel"
      onCancel={() => setConfirming(undefined)}
      onConfirm={() => {
        const target = confirming;
        setConfirming(undefined);
        void setStatus(target, "suspended");
      }}
    >
      Their cars stop appearing to renters while the partner is suspended. You can activate the partner again at any time.
    </ConfirmDialog>
  ) : null;

  return {
    /** Pending -> active. */
    approve: (p: Target) => void setStatus(p, "active"),
    /** Suspended -> active. */
    activate: (p: Target) => void setStatus(p, "active"),
    requestSuspend: (p: Target) => setConfirming(p),
    dialogs,
  };
}
