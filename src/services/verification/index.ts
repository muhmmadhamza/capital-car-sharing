import { guard } from "../errors";
import { verificationApi } from "../api/verification.service";
import type { CustomerVerificationResponse, DocumentSide, VerificationInput } from "@/types/verification";

/** Builds the multipart body. Only fields that are present are sent, so a resubmission can send just what changed. */
function toForm(input: VerificationInput): FormData {
  const form = new FormData();
  const text: Array<keyof Omit<VerificationInput, "front" | "back">> = ["fullLegalName", "dateOfBirth", "country", "phone", "documentType", "documentNumber"];
  for (const key of text) {
    const value = input[key];
    if (value !== undefined && value !== "") form.append(key, value.trim());
  }
  if (input.front) form.append("front", input.front, input.front.name);
  if (input.back) form.append("back", input.back, input.back.name);
  return form;
}

/** Customer verification, backed by the real API. The customer is always the signed-in one (decided by the server). */
export const verificationService = {
  get: (): Promise<CustomerVerificationResponse> => guard(() => verificationApi.get()),
  submit: (input: VerificationInput, onProgress?: (percent: number) => void) => guard(() => verificationApi.submit(toForm(input), onProgress)),
  resubmit: (input: VerificationInput, onProgress?: (percent: number) => void) => guard(() => verificationApi.resubmit(toForm(input), onProgress)),
  /** The customer's own uploaded file as a Blob. Show it from URL.createObjectURL and revoke the URL afterwards. */
  document: (side: DocumentSide): Promise<Blob> => guard(() => verificationApi.ownDocument(side)),
};
