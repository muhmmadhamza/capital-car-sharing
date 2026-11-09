"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditIcon, TrashIcon, XCircleIcon } from "@/components/ui/Icons";
import { carLabel } from "@/features/admin/format";
import { activateCar, approveCar, deleteCar, rejectCar, suspendCar } from "@/services/admin/car.service";
import { errorMessage } from "@/services/errors";
import type { AdminCarView, CarApprovalStatus } from "@/types/admin";
import { CheckCircleIcon, PauseCircleIcon } from "../AdminIcons";
import { useAdminToast, type RowAction } from "../ui";
import { EditCarModal } from "./EditCarModal";

type Target = AdminCarView;

/** The actions that make sense for a car's current approval status. Shared by the list and the car page. */
export function carMenu(
  car: Pick<AdminCarView, "id" | "approvalStatus">,
  a: { edit: () => void; approve: () => void; reject: () => void; suspend: () => void; activate: () => void; remove: () => void },
  options: { includeView?: boolean } = {},
): RowAction[] {
  const menu: RowAction[] = [];
  if (options.includeView) menu.push({ label: "View car", href: `/admin/cars/${car.id}` });
  menu.push({ label: "Edit", icon: EditIcon, onClick: a.edit });
  if (car.approvalStatus === "pending" || car.approvalStatus === "rejected") menu.push({ label: "Approve", icon: CheckCircleIcon, onClick: a.approve });
  if (car.approvalStatus === "pending") menu.push({ label: "Reject", icon: XCircleIcon, tone: "danger", onClick: a.reject });
  if (car.approvalStatus === "suspended") menu.push({ label: "Activate", icon: CheckCircleIcon, onClick: a.activate });
  if (car.approvalStatus === "approved") menu.push({ label: "Suspend", icon: PauseCircleIcon, tone: "danger", onClick: a.suspend });
  menu.push({ label: "Delete", icon: TrashIcon, tone: "danger", onClick: a.remove });
  return menu;
}

/**
 * Approval workflow and edit/delete flow, shared by the cars list and the car page.
 *
 * Status changes show at once: the screen's `apply` shows the change, and if the service
 * refuses it the hook calls `apply(id, undefined)` so the screen can undo it. Delete and edit
 * wait for the service because they can be refused with a reason the admin needs to read.
 */
export function useCarActions({ apply, onDeleted }: { apply: (id: string, patch: Partial<AdminCarView> | undefined) => void; onDeleted: (id: string) => void }) {
  const notify = useAdminToast();
  const [rejecting, setRejecting] = useState<Target>();
  const [suspending, setSuspending] = useState<Target>();
  const [editing, setEditing] = useState<Target>();
  const [deleting, setDeleting] = useState<{ car: Target; busy: boolean; error?: string }>();

  async function move(car: Target, to: CarApprovalStatus, call: (id: string) => Promise<AdminCarView>, done: string) {
    apply(car.id, { approvalStatus: to });
    try {
      await call(car.id);
      notify(done);
    } catch (err) {
      apply(car.id, undefined);
      notify(errorMessage(err), "error");
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    const { car } = deleting;
    setDeleting({ car, busy: true });
    try {
      await deleteCar(car.id);
      setDeleting(undefined);
      onDeleted(car.id);
      notify(`${carLabel(car)} has been deleted.`);
    } catch (err) {
      setDeleting({ car, busy: false, error: errorMessage(err) });
    }
  }

  const dialogs: ReactNode = (
    <>
      {rejecting ? (
        <ConfirmDialog
          title={`Reject ${carLabel(rejecting)}?`}
          confirmLabel="Reject"
          cancelLabel="Cancel"
          onCancel={() => setRejecting(undefined)}
          onConfirm={() => {
            const car = rejecting;
            setRejecting(undefined);
            void move(car, "rejected", rejectCar, `${carLabel(car)} has been rejected.`);
          }}
        >
          The listing stays hidden from renters. You can approve it later if the partner fixes the issue.
        </ConfirmDialog>
      ) : null}
      {suspending ? (
        <ConfirmDialog
          title={`Suspend ${carLabel(suspending)}?`}
          confirmLabel="Suspend"
          cancelLabel="Cancel"
          onCancel={() => setSuspending(undefined)}
          onConfirm={() => {
            const car = suspending;
            setSuspending(undefined);
            void move(car, "suspended", suspendCar, `${carLabel(car)} has been suspended.`);
          }}
        >
          The car stops appearing to renters while it is suspended. Existing reservations are not changed. You can activate it again at any time.
        </ConfirmDialog>
      ) : null}
      {deleting ? (
        <ConfirmDialog
          title={`Delete ${carLabel(deleting.car)}?`}
          confirmLabel="Delete car"
          cancelLabel="Cancel"
          busy={deleting.busy}
          error={deleting.error}
          onCancel={() => setDeleting(undefined)}
          onConfirm={() => void confirmDelete()}
        >
          This removes the car from the platform. Past reservations keep their history. This cannot be undone.
        </ConfirmDialog>
      ) : null}
      {editing ? (
        <EditCarModal
          car={editing}
          onClose={() => setEditing(undefined)}
          onSaved={(row) => {
            apply(row.id, row);
            setEditing(undefined);
            notify(`${carLabel(row)} has been updated.`);
          }}
        />
      ) : null}
    </>
  );

  return {
    /** Pending or rejected -> approved (Active). */
    approve: (c: Target) => void move(c, "approved", approveCar, `${carLabel(c)} has been approved and is now Active.`),
    /** Suspended -> approved (Active). */
    activate: (c: Target) => void move(c, "approved", activateCar, `${carLabel(c)} is Active again.`),
    requestReject: (c: Target) => setRejecting(c),
    requestSuspend: (c: Target) => setSuspending(c),
    requestDelete: (c: Target) => setDeleting({ car: c, busy: false }),
    requestEdit: (c: Target) => setEditing(c),
    dialogs,
  };
}
