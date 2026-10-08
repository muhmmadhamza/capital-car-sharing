import type { AdminSettings } from "@/types/admin";

/** Currencies an admin can pick. The code is what the API stores. */
export const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "US dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British pound (GBP)" },
  { code: "AED", label: "UAE dirham (AED)" },
  { code: "CAD", label: "Canadian dollar (CAD)" },
  { code: "AUD", label: "Australian dollar (AUD)" },
  { code: "PKR", label: "Pakistani rupee (PKR)" },
];

export type SettingsField = keyof AdminSettings;
export type SettingsErrors = Partial<Record<SettingsField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const wholeNumber = (v: number) => Number.isInteger(v);

/** Shared by the form (instant feedback) and the mock service. The API must validate again. */
export function validateSettings(s: AdminSettings): SettingsErrors {
  const errors: SettingsErrors = {};
  if (s.platformName.trim().length < 2) errors.platformName = "Enter the platform name.";
  if (!s.contactEmail.trim()) errors.contactEmail = "Enter a contact email.";
  else if (!EMAIL_RE.test(s.contactEmail.trim())) errors.contactEmail = "Enter a valid email address.";

  const phone = s.contactPhone.trim();
  const digits = phone.replace(/\D/g, "");
  if (!phone) errors.contactPhone = "Enter a contact phone number.";
  else if (!/^[+\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) errors.contactPhone = "Enter a valid phone number.";

  if (!CURRENCIES.some((c) => c.code === s.currency)) errors.currency = "Choose a currency.";
  if (!Number.isFinite(s.defaultDailyRate) || s.defaultDailyRate <= 0) errors.defaultDailyRate = "Enter a daily rate above zero.";
  else if (s.defaultDailyRate > 10_000) errors.defaultDailyRate = "That rate looks too high.";

  if (!wholeNumber(s.minRentalDays) || s.minRentalDays < 1) errors.minRentalDays = "Use a whole number of at least 1 day.";
  if (!wholeNumber(s.maxRentalDays) || s.maxRentalDays < 1) errors.maxRentalDays = "Use a whole number of at least 1 day.";
  else if (!errors.minRentalDays && s.maxRentalDays < s.minRentalDays) errors.maxRentalDays = "The maximum cannot be shorter than the minimum.";
  else if (s.maxRentalDays > 365) errors.maxRentalDays = "Use 365 days or fewer.";
  return errors;
}

export const settingsEqual = (a: AdminSettings, b: AdminSettings) =>
  (Object.keys(a) as SettingsField[]).every((k) => a[k] === b[k]);
