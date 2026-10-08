import { httpAdminCars } from "./http";
import { mockAdminCars } from "./mock/cars";
import { isAdminApi } from "./source";
import type { AdminCarRepository } from "./contracts";

const repo: AdminCarRepository = isAdminApi ? httpAdminCars : mockAdminCars;

export const getCars: AdminCarRepository["getCars"] = () => repo.getCars();
export const getCarById: AdminCarRepository["getCarById"] = (id) => repo.getCarById(id);
export const getCarLocations: AdminCarRepository["getCarLocations"] = () => repo.getCarLocations();
export const updateCar: AdminCarRepository["updateCar"] = (id, input) => repo.updateCar(id, input);
export const updateCarStatus: AdminCarRepository["updateCarStatus"] = (id, status) => repo.updateCarStatus(id, status);
export const approveCar: AdminCarRepository["approveCar"] = (id) => repo.approveCar(id);
export const rejectCar: AdminCarRepository["rejectCar"] = (id) => repo.rejectCar(id);
export const suspendCar: AdminCarRepository["suspendCar"] = (id) => repo.suspendCar(id);
export const activateCar: AdminCarRepository["activateCar"] = (id) => repo.activateCar(id);
export const deleteCar: AdminCarRepository["deleteCar"] = (id) => repo.deleteCar(id);
