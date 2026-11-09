"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { updateCustomerStatus } from "@/services/admin/customer.service";
import { errorMessage } from "@/services/errors";
import type { AdminCustomerRow, CustomerStatus } from "@/types/admin";
import { useAdminToast } from "../ui";
import { EditCustomerModal } from "./EditCustomerModal";

type Target = Pick<AdminCustomerRow, "id" | "name" | "email" | "phone" | "status">;

/**
 * Activate / deactivate / edit flow shared by the customers list and the customer page.
 * The screen passes `apply`, which shows a change immediately; this hook calls the service
 * and, if it fails, passes the old status back so the screen can undo it.
 */
export function useCustomerActions({
  apply,
  applyRow,
}: {
  apply: (id: string, patch: Partial<AdminCustomerRow> | undefined) => void;
  applyRow: (row: AdminCustomerRow) => void;
}) {
  const notify = useAdminToast();
  const [confirming, setConfirming] = useState<Target>();
  const [editing, setEditing] = useState<Target>();

  async function setStatus(customer: Target, status: CustomerStatus) {
    apply(customer.id, { status });
    try {
      await updateCustomerStatus(customer.id, status);
      notify(`${customer.name} is now ${status}.`);
    } catch (err) {
      apply(customer.id, undefined);
      notify(errorMessage(err), "error");
    }
  }

  const activate = (c: Target) => void setStatus(c, "active");
  const requestDeactivate = (c: Target) => setConfirming(c);

  const dialogs: ReactNode = (
    <>
      {confirming ? (
        <ConfirmDialog
          title={`Deactivate ${confirming.name}?`}
          confirmLabel="Deactivate"
          cancelLabel="Cancel"
          onCancel={() => setConfirming(undefined)}
          onConfirm={() => {
            const target = confirming;
            setConfirming(undefined);
            void setStatus(target, "inactive");
          }}
        >
          They will not be able to make new reservations until the account is activated again. Existing reservations are not changed.
        </ConfirmDialog>
      ) : null}
      {editing ? (
        <EditCustomerModal
          customer={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(row) => {
            applyRow(row);
            setEditing(undefined);
            notify("Customer details saved.");
          }}
        />
      ) : null}
    </>
  );

  return { activate, requestDeactivate, edit: setEditing, dialogs };
}
