"use client";

import { usePartnerAuth } from "@/components/partner/PartnerAuthProvider";
import { partnerData } from "@/services/partner";
import { useAsync } from "./useAsync";

/** Data hooks for the partner portal. Each one is scoped to the signed-in partner. */
function usePartnerId(): string {
  const { partner } = usePartnerAuth();
  return partner?.id ?? "";
}

export function usePartnerStats() {
  const id = usePartnerId();
  return useAsync(() => partnerData.getStats(id), [id]);
}

export function usePartnerCars() {
  const id = usePartnerId();
  return useAsync(() => partnerData.listCars(id), [id]);
}

export function usePartnerCar(carId: string) {
  const id = usePartnerId();
  return useAsync(() => partnerData.getCar(id, carId), [id, carId]);
}

export function usePartnerReservations() {
  const id = usePartnerId();
  return useAsync(() => partnerData.listReservations(id), [id]);
}

export function usePartnerReservation(reservationId: string) {
  const id = usePartnerId();
  return useAsync(() => partnerData.getReservation(id, reservationId), [id, reservationId]);
}
