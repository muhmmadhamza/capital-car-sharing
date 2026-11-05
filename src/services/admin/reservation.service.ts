import { apiAdminReservations } from "./api-repository";
import type { AdminReservationRepository } from "./contracts";

const repo: AdminReservationRepository = apiAdminReservations;

export const getReservations: AdminReservationRepository["getReservations"] = () => repo.getReservations();
export const getReservationById: AdminReservationRepository["getReservationById"] = (id) => repo.getReservationById(id);
