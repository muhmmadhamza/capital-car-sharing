"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { getReservation, listReservations } from "@/services/reservations";
import { useAsync } from "./useAsync";

/** The signed-in customer's reservations. Only call inside the protected customer area. */
export function useReservations() {
  const { customer } = useAuth();
  const id = customer?.id;
  return useAsync(() => (id ? listReservations(id) : Promise.resolve([])), [id]);
}

export function useReservation(reservationId: string) {
  const { customer } = useAuth();
  const id = customer?.id;
  return useAsync(() => (id ? getReservation(reservationId, id) : Promise.resolve(null)), [id, reservationId]);
}
