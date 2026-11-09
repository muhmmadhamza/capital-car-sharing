import { api, type ApiMeta } from '@/lib/api-client';
import type { Car, CarAvailability, CarSearchFilters } from '@/types/api';

export const carsService = {
  async search(filters: CarSearchFilters = {}): Promise<{ cars: Car[]; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ cars: Car[] }>('/cars', filters as Record<string, string | number>);
    return { cars: data.cars, meta };
  },

  async getById(id: number | string): Promise<Car> {
    const { data } = await api.get<{ car: Car }>(`/cars/${id}`);
    return data.car;
  },

  async getAvailability(id: number | string, range?: { startDate?: string; endDate?: string }): Promise<CarAvailability> {
    const { data } = await api.get<CarAvailability>(`/cars/${id}/availability`, range);
    return data;
  },
};
