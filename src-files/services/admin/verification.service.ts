import type { ApiMeta } from "@/lib/api-client";
import type {
  AdminVerificationDetail,
  AdminVerificationRow,
  DocumentSide,
  ReviewDecision,
  VerificationCounts,
  VerificationStatus,
} from "@/types/verification";
import { adminVerificationApi } from "../api/verification.service";
import { guard, ServiceError } from "../errors";
import { idOf, numericId } from "../mappers/common";

const mustBeId = (id: string): number => {
  const n = numericId(id);
  if (n === null) throw new ServiceError("not_found", "Verification not found.");
  return n;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toDetail = (v: any): AdminVerificationDetail => ({ ...v, id: idOf(v.id), customer: { ...v.customer, id: idOf(v.customer.id) } });

export interface VerificationList {
  rows: AdminVerificationRow[];
  counts: VerificationCounts;
  meta?: ApiMeta;
}

/** Admin review of identity verifications. Every call is authorized again by the API (admin role only). */
export const getVerifications = (p: { status?: VerificationStatus | "all"; search?: string; page?: number; limit?: number }): Promise<VerificationList> =>
  guard(async () => {
    const { rows, counts, meta } = await adminVerificationApi.list({ ...p, status: p.status === "all" ? undefined : p.status });
    return {
      rows: rows.map((r) => ({
        ...r,
        id: idOf(r.id),
        customerId: idOf(r.customerId),
        documentsPurged: Boolean(r.documentsPurgedAt),
      })),
      counts,
      meta,
    };
  });

export const getVerification = (id: string): Promise<AdminVerificationDetail> => guard(async () => toDetail(await adminVerificationApi.get(mustBeId(id))));

export const reviewVerification = (id: string, status: ReviewDecision, reason?: string): Promise<AdminVerificationDetail> =>
  guard(async () => toDetail(await adminVerificationApi.setStatus(mustBeId(id), status, reason)), "invalid_input");

/** The document as a Blob; show it from URL.createObjectURL and revoke the URL afterwards. */
export const getVerificationDocument = (id: string, side: DocumentSide): Promise<Blob> => guard(() => adminVerificationApi.document(mustBeId(id), side));
