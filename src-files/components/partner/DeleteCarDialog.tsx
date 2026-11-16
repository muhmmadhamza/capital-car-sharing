"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { errorMessage } from "@/services/errors";
import { partnerData } from "@/services/partner";
import type { PartnerCarView } from "@/types/partner";
import { usePartnerAuth } from "./PartnerAuthProvider";
import { carName } from "./parts";

/** Confirmation + delete call, shared by My Cars and the car details page. */
export function DeleteCarDialog({ car, onDeleted, onCancel }: { car: PartnerCarView; onDeleted: () => void; onCancel: () => void }) {
  const { partner } = usePartnerAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function confirm() {
    if (!partner) return;
    setBusy(true);
    setError(undefined);
    try {
      await partnerData.deleteCar(partner.id, car.id);
      onDeleted();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      title={`Delete ${carName(car)}?`}
      confirmLabel="Delete car"
      cancelLabel="Keep car"
      busy={busy}
      error={error}
      onConfirm={confirm}
      onCancel={onCancel}
    >
      This removes the listing, its photos and its availability. This cannot be undone.
    </ConfirmDialog>
  );
}
