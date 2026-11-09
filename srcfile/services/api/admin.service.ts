import { api, type ApiMeta } from '@/lib/api-client';
import type { AdminDashboard, Car, PartnerProfile, Reservation, User } from '@/types/api';

type Page = { page?: number; limit?: number; status?: string };

export const adminService = {
  async getDashboard(): Promise<AdminDashboard> {
    const { data } = await api.get<AdminDashboard>('/admin/dashboard');
    return data;
  },

  async getCustomers(p: Page & { search?: string } = {}): Promise<{ customers: User[]; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ customers: User[] }>('/admin/customers', p);
    return { customers: data.customers, meta };
  },

  async getPartners(p: Page = {}): Promise<{ partners: PartnerProfile[]; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ partners: PartnerProfile[] }>('/admin/partners', p);
    return { partners: data.partners, meta };
  },

  async getCars(p: Page & { approvalStatus?: string; partnerId?: number } = {}): Promise<{ cars: Car[]; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ cars: Car[] }>('/admin/cars', p);
    return { cars: data.cars, meta };
  },

  async getReservations(p: Page = {}): Promise<{ reservations: Reservation[]; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ reservations: Reservation[] }>('/admin/reservations', p);
    return { reservations: data.reservations, meta };
  },

  async approveCar(id: number): Promise<Car> {
    return (await api.patch<{ car: Car }>(`/admin/cars/${id}/approve`)).data.car;
  },
  async rejectCar(id: number): Promise<Car> {
    return (await api.patch<{ car: Car }>(`/admin/cars/${id}/reject`)).data.car;
  },
  async suspendCar(id: number): Promise<Car> {
    return (await api.patch<{ car: Car }>(`/admin/cars/${id}/suspend`)).data.car;
  },
  async suspendPartner(id: number) {
    return (await api.patch<{ partner: { id: number; status: string } }>(`/admin/partners/${id}/suspend`)).data.partner;
  },
  async activatePartner(id: number) {
    return (await api.patch<{ partner: { id: number; status: string } }>(`/admin/partners/${id}/activate`)).data.partner;
  },
};
