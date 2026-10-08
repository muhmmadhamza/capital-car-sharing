import { httpAdminReservations } from "./http";
import { mockAdminReservations } from "./mock/reservations";
import { isAdminApi } from "./source";
import type { AdminReservationRepository } from "./contracts";

const repo: AdminReservationRepository = isAdminApi ? httpAdminReservations : mockAdminReservations;

export const getReservations: AdminReservationRepository["getReservations"] = () => repo.getReservations();
export const getReservationById: AdminReservationRepository["getReservationById"] = (id) => repo.getReservationById(id);
