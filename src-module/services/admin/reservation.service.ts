import { apiAdminReservations } from "./api-repository";
import type { AdminReservationRepository } from "./contracts";

const repo: AdminReservationRepository = apiAdminReservations;

export const getReservations: AdminReservationRepository["getReservations"] = () => repo.getReservations();
export const getReservationById: AdminReservationRepository["getReservationById"] = (id) => repo.getReservationById(id);
export const setReservationStatus: AdminReservationRepository["setReservationStatus"] = (id, status, reason) => repo.setReservationStatus(id, status, reason);
