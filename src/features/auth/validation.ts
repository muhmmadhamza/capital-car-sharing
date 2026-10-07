/**
 * Pure form validation, shared by every auth form. The API must validate again;
 * this only gives instant feedback.
 */
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Errors<K extends string> = Partial<Record<K, string>>;

export function validateEmail(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your email address.";
  if (!EMAIL_RE.test(v)) return "Enter a valid email address.";
}

export function validateName(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your full name.";
  if (v.length < 2) return "Your name looks too short.";
}

export function validatePhone(value: string): string | undefined {
  const v = value.trim();
  if (!v) return "Enter your phone number.";
  const digits = v.replace(/\D/g, "");
  if (!/^[+\d\s().-]+$/.test(v) || digits.length < 7 || digits.length > 15) return "Enter a valid phone number.";
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Create a password.";
  if (value.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
}

export function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return "Confirm your password.";
  if (confirm !== password) return "Passwords do not match.";
}

export const hasErrors = (errors: Record<string, string | undefined>) => Object.values(errors).some(Boolean);

/** Remove undefined entries so `hasErrors` and rendering stay simple. */
export function compact<K extends string>(errors: Record<K, string | undefined>): Errors<K> {
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as Errors<K>;
}
