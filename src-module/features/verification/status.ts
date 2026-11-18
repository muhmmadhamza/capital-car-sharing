import type { Tone } from "@/features/admin/status";
import type { DocumentTypeOption, ReviewDecision, VerificationEvent, VerificationStatus } from "@/types/verification";

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  not_submitted: "Not submitted",
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_required: "Resubmission required",
};

export const verificationTone = (s: VerificationStatus): Tone =>
  s === "approved" ? "success" : s === "pending_review" ? "gold" : s === "not_submitted" ? "navy" : "danger";

export const DECISION_LABELS: Record<ReviewDecision, string> = {
  approved: "Approve",
  rejected: "Reject",
  resubmission_required: "Request resubmission",
};

/** Used only when the server's list does not contain a type (for example one that was later switched off). */
export const documentTypeLabel = (type: string, options: DocumentTypeOption[] = []): string =>
  options.find((o) => o.type === type)?.label ??
  ({ national_id: "National identity card", passport: "Passport", driving_licence: "Driving licence" } as Record<string, string>)[type] ??
  type.replace(/_/g, " ");

export const EVENT_LABELS: Record<VerificationEvent["event"], string> = {
  submitted: "Submitted for review",
  resubmitted: "Resubmitted for review",
  approved: "Approved",
  rejected: "Rejected",
  resubmission_requested: "Resubmission requested",
  document_viewed: "Document viewed",
  documents_purged: "Documents deleted (retention policy)",
};

/** Customer-facing explanation of each status and what happens next. */
export const NEXT_STEPS: Record<VerificationStatus, { title: string; text: string }> = {
  not_submitted: {
    title: "Verify your identity to start booking",
    text: "Upload a valid identity document. It takes a few minutes, and you only do it once.",
  },
  pending_review: {
    title: "We're reviewing your documents",
    text: "A member of our team will check your submission and email you with the decision. You can't book until it's approved, and you can't edit it while it's under review.",
  },
  approved: {
    title: "You're verified",
    text: "Your identity is confirmed. You can reserve any available car.",
  },
  rejected: {
    title: "We couldn't approve your verification",
    text: "Read the reason below, correct the information or documents, and submit again.",
  },
  resubmission_required: {
    title: "We need a little more from you",
    text: "Follow the instructions below, update your submission and send it again.",
  },
};
