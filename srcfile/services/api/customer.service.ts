import { api } from '@/lib/api-client';
import type { Reservation, ReservationStatus, User } from '@/types/api';

export const customerService = {
  async getProfile(): Promise<User> {
    const { data } = await api.get<{ customer: User }>('/customers/me');
    return data.customer;
  },

  async updateProfile(input: { name?: string; phone?: string; avatar?: string | null }): Promise<User> {
    const { data } = await api.put<{ customer: User }>('/customers/me', input);
    return data.customer;
  },

  async getReservations(status?: ReservationStatus): Promise<Reservation[]> {
    const { data } = await api.get<{ reservations: Reservation[] }>('/customers/me/reservations', { status });
    return data.reservations;
  },
};
