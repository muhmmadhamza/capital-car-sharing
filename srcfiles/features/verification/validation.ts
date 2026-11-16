import { validatePhone } from "@/features/auth/validation";
import type { DocumentTypeOption, VerificationPolicy } from "@/types/verification";

/**
 * Instant feedback only. The API validates every field and inspects the real contents of every file again, so
 * nothing here is a security control.
 */

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} '’.\-]{1,119}$/u;
const DOC_NUMBER_RE = /^[A-Za-z0-9][A-Za-z0-9 \-/]{3,31}$/;

export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export function validateLegalName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your full legal name.";
  if (!NAME_RE.test(v)) return "Use your name exactly as on your document: letters, spaces, apostrophes and hyphens only.";
}

export function ageOn(dob: string, today = new Date()): number {
  const [y, m, d] = dob.split("-").map(Number);
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export function validateDob(value: string, minAge: number): string | undefined {
  if (!value) return "Enter your date of birth.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) return "Enter a valid date of birth.";
  const age = ageOn(value);
  if (age < 0) return "Your date of birth cannot be in the future.";
  if (age < minAge) return `You must be at least ${minAge} years old.`;
  if (age > 120) return "Enter a valid date of birth.";
}

export function validateCountry(value: string, policy: VerificationPolicy): string | undefined {
  if (!value) return "Choose your country of residence.";
  if (!policy.countries.some((c) => c.code === value)) return "Choose a country from the list.";
}

export const validateVerificationPhone = validatePhone;

export function validateDocumentNumber(value: string, type: DocumentTypeOption | undefined): string | undefined {
  const v = value.trim();
  if (!v) return type?.requiresNumber ? "Enter the document number." : undefined;
  if (!DOC_NUMBER_RE.test(v)) return "Use 4-32 letters, numbers, spaces, hyphens or slashes.";
}

export const formatBytes = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Quick check of a picked file. The server re-checks the real file type from its bytes. */
export function validateFile(file: File, policy: VerificationPolicy): string | undefined {
  const maxBytes = policy.maxFileSizeMb * 1024 * 1024;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const looksRight = ALLOWED_MIME.has(file.type) || (file.type === "" && ["jpg", "jpeg", "png", "webp", "pdf"].includes(ext));
  if (!looksRight) return `That file type isn't accepted. Use ${policy.acceptedFormats.map((f) => f.label).join(", ")}.`;
  if (file.size === 0) return "That file is empty.";
  if (file.size > maxBytes) return `That file is ${formatBytes(file.size)}. The maximum is ${policy.maxFileSizeMb} MB.`;
}
