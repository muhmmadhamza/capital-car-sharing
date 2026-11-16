/**
 * Customer identity verification. Mirrors the API in backend/src/services/verification.service.js.
 * The browser never receives storage paths or permanent document URLs: documents are fetched on demand through
 * authenticated endpoints and shown from a short-lived in-memory blob.
 */

export type VerificationStatus = "not_submitted" | "pending_review" | "approved" | "rejected" | "resubmission_required";

/** The statuses a review can end in (what an admin picks). */
export type ReviewDecision = "approved" | "rejected" | "resubmission_required";

export type DocumentSide = "front" | "back";

export interface DocumentTypeOption {
  /** e.g. "national_id", "passport", "driving_licence". Configured on the server. */
  type: string;
  label: string;
  requiresBack: boolean;
  requiresNumber: boolean;
}

export interface CountryOption {
  /** ISO 3166-1 alpha-2, e.g. "PK". */
  code: string;
  name: string;
}

/** What the server currently accepts. Everything the form shows (types, countries, limits) comes from here. */
export interface VerificationPolicy {
  documentTypes: DocumentTypeOption[];
  countries: CountryOption[];
  minAge: number;
  maxFileSizeMb: number;
  acceptedFormats: { mime: string; label: string }[];
}

export interface DocumentInfo {
  side: DocumentSide;
  mimeType: string;
  sizeBytes: number;
  /** ISO 8601 timestamp. */
  uploadedAt: string;
}

export interface VerificationDetails {
  fullLegalName: string;
  /** "YYYY-MM-DD" */
  dateOfBirth: string;
  country: string;
  phone: string;
  documentType: string;
  /** Last characters only, e.g. "••••1231". The full number is never sent back to the customer. */
  documentNumberMasked: string | null;
}

export interface CustomerVerification {
  status: VerificationStatus;
  /** True when there is no record yet, or an admin asked for changes. */
  canSubmit: boolean;
  /** The server's answer to "may this customer book?". Informational; bookings are checked on the server again. */
  bookingEligible: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  /** The admin's customer-facing message for rejected / resubmission_required. */
  reason: string | null;
  details: VerificationDetails | null;
  documents: DocumentInfo[];
  /** The files were deleted under the retention policy. */
  documentsPurged: boolean;
  profile: { name: string; email: string; phone: string | null };
}

export interface CustomerVerificationResponse {
  verification: CustomerVerification;
  policy: VerificationPolicy;
}

/** What the form sends. On a resubmission only changed fields need to be present. */
export interface VerificationInput {
  fullLegalName?: string;
  dateOfBirth?: string;
  country?: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  front?: File;
  back?: File;
}

// --------------------------------------------------------------------------------------------- admin

export interface AdminVerificationRow {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  fullLegalName: string;
  status: Exclude<VerificationStatus, "not_submitted">;
  documentType: string;
  country: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerName: string | null;
  documentsPurged: boolean;
}

export type VerificationCounts = Partial<Record<Exclude<VerificationStatus, "not_submitted">, number>>;

export interface VerificationEvent {
  id: number;
  event: "submitted" | "resubmitted" | "approved" | "rejected" | "resubmission_requested" | "document_viewed" | "documents_purged";
  fromStatus: string | null;
  toStatus: string | null;
  reason: string | null;
  /** true = the SMTP server accepted the email, false = no email was sent, null = none attempted. */
  customerNotified: boolean | null;
  createdAt: string;
  actorName: string | null;
  actorRole: string | null;
}

export interface AdminVerificationDetail {
  id: string;
  status: Exclude<VerificationStatus, "not_submitted">;
  customer: { id: string; name: string; email: string; accountStatus: string };
  details: {
    fullLegalName: string;
    dateOfBirth: string;
    country: string;
    phone: string;
    documentType: string;
    documentNumber: string | null;
    documentNumberUnreadable: boolean;
  };
  reason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  submittedAt: string;
  documentsPurged: boolean;
  documents: DocumentInfo[];
  /** Decisions the server will accept from the current status. */
  allowedActions: ReviewDecision[];
  history: VerificationEvent[];
}
