import { api } from '@/lib/api-client';
import type { Car, CarAvailability, CarInput, PartnerProfile } from '@/types/api';

export const partnerService = {
  async getProfile(): Promise<PartnerProfile> {
    const { data } = await api.get<{ partner: PartnerProfile }>('/partners/me');
    return data.partner;
  },

  async updateProfile(input: Partial<{ name: string; phone: string; avatar: string | null; companyName: string; address: string }>): Promise<PartnerProfile> {
    const { data } = await api.put<{ partner: PartnerProfile }>('/partners/me', input);
    return data.partner;
  },

  async listCars(): Promise<Car[]> {
    const { data } = await api.get<{ cars: Car[] }>('/partners/me/cars');
    return data.cars;
  },

  async getCar(id: number | string): Promise<Car> {
    const { data } = await api.get<{ car: Car }>(`/partners/me/cars/${id}`);
    return data.car;
  },

  async createCar(input: CarInput): Promise<Car> {
    const { data } = await api.post<{ car: Car }>('/partners/me/cars', input);
    return data.car;
  },

  async updateCar(id: number | string, input: Partial<CarInput>): Promise<Car> {
    const { data } = await api.put<{ car: Car }>(`/partners/me/cars/${id}`, input);
    return data.car;
  },

  async deleteCar(id: number | string): Promise<{ deleted?: boolean; deactivated?: boolean }> {
    const { data } = await api.delete<{ deleted?: boolean; deactivated?: boolean }>(`/partners/me/cars/${id}`);
    return data;
  },

  /**
   * Uploads one photo and returns its public URL.
   * With a car id the photo is saved to that car straight away; without one (a car that is not saved yet)
   * the file is only stored and the URL is saved together with the car.
   */
  async uploadCarImage(file: File, opts: { carId?: number; onProgress?: (percent: number) => void } = {}): Promise<string> {
    const path = opts.carId ? `/partners/me/cars/${opts.carId}/images` : "/partners/me/car-images";
    const { data } = await api.upload<{ image: { url: string } }>(path, file, { onProgress: opts.onProgress });
    return data.image.url;
  },

  /** Calendar of one of the partner's own cars. Works whether or not the car is published yet. */
  async getCarAvailability(id: number | string, range?: { startDate?: string; endDate?: string }): Promise<CarAvailability> {
    const { data } = await api.get<CarAvailability>(`/partners/me/cars/${id}/availability`, range);
    return data;
  },

  async setCarAvailability(id: number | string, dates: string[], status: 'available' | 'unavailable'): Promise<CarAvailability> {
    const { data } = await api.put<CarAvailability>(`/partners/me/cars/${id}/availability`, { dates, status });
    return data;
  },
};
