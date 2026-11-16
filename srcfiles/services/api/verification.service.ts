import { api, type ApiMeta } from "@/lib/api-client";
import type {
  AdminVerificationRow,
  CustomerVerificationResponse,
  DocumentSide,
  ReviewDecision,
  VerificationCounts,
} from "@/types/verification";

/** Raw endpoints for identity verification. Screens use src/services/verification and services/admin/verification.service. */
export const verificationApi = {
  async get(): Promise<CustomerVerificationResponse> {
    return (await api.get<CustomerVerificationResponse>("/customer/verification")).data;
  },
  async submit(form: FormData, onProgress?: (p: number) => void): Promise<CustomerVerificationResponse["verification"]> {
    return (await api.uploadForm<{ verification: CustomerVerificationResponse["verification"] }>("POST", "/customer/verification", form, { onProgress })).data.verification;
  },
  async resubmit(form: FormData, onProgress?: (p: number) => void): Promise<CustomerVerificationResponse["verification"]> {
    return (await api.uploadForm<{ verification: CustomerVerificationResponse["verification"] }>("PATCH", "/customer/verification", form, { onProgress })).data.verification;
  },
  ownDocument: (side: DocumentSide) => api.download(`/customer/verification/documents/${side}`),
};

type ApiRow = Omit<AdminVerificationRow, "id" | "customerId" | "customerName" | "customerEmail" | "reviewerName" | "documentsPurged"> & {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  reviewerName: string | null;
  documentsPurgedAt: string | null;
};

export const adminVerificationApi = {
  async list(p: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ rows: ApiRow[]; counts: VerificationCounts; meta?: ApiMeta }> {
    const { data, meta } = await api.get<{ verifications: ApiRow[]; counts: VerificationCounts }>("/admin/verifications", p);
    return { rows: data.verifications, counts: data.counts, meta };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(id: number): Promise<any> {
    return (await api.get<{ verification: unknown }>(`/admin/verifications/${id}`)).data.verification;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setStatus(id: number, status: ReviewDecision, reason?: string): Promise<any> {
    return (await api.patch<{ verification: unknown }>(`/admin/verifications/${id}/status`, { status, reason })).data.verification;
  },
  document: (id: number, side: DocumentSide) => api.download(`/admin/verifications/${id}/documents/${side}`),
};
