import { httpAdminCustomers } from "./http";
import { mockAdminCustomers } from "./mock/customers";
import { isAdminApi } from "./source";
import type { AdminCustomerRepository } from "./contracts";

const repo: AdminCustomerRepository = isAdminApi ? httpAdminCustomers : mockAdminCustomers;

export const getCustomers: AdminCustomerRepository["getCustomers"] = () => repo.getCustomers();
export const getCustomerById: AdminCustomerRepository["getCustomerById"] = (id) => repo.getCustomerById(id);
export const updateCustomer: AdminCustomerRepository["updateCustomer"] = (id, input) => repo.updateCustomer(id, input);
export const updateCustomerStatus: AdminCustomerRepository["updateCustomerStatus"] = (id, status) => repo.updateCustomerStatus(id, status);
