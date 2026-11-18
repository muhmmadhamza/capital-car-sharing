import { api } from '@/lib/api-client';
import type { BookingWindowInput, Reservation, ReservationQuote, ReservationStatus, User } from '@/types/api';

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

  async getReservation(id: number | string): Promise<Reservation> {
    const { data } = await api.get<{ reservation: Reservation }>(`/customers/me/reservations/${id}`);
    return data.reservation;
  },

  /** Availability + price breakdown for a window. Creates nothing. */
  /** Cancels the customer's own booking. The server decides whether it is eligible (409 when it is not). */
  async cancelReservation(id: number | string, reason?: string): Promise<Reservation> {
    const { data } = await api.post<{ reservation: Reservation }>(`/customers/me/reservations/${id}/cancel`, reason ? { reason } : {});
    return data.reservation;
  },

  async quoteReservation(input: BookingWindowInput): Promise<ReservationQuote> {
    const { data } = await api.post<ReservationQuote>('/customers/me/reservations/quote', input);
    return data;
  },

  /** Creates the reservation. The server rejects it (403) unless the customer's verification is approved. */
  async createReservation(input: BookingWindowInput): Promise<Reservation> {
    const { data } = await api.post<{ reservation: Reservation }>('/customers/me/reservations', input);
    return data.reservation;
  },
};
