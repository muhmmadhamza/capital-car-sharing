"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert, FormField } from "@/components/ui/FormField";
import { SelectField } from "@/components/ui/FormControls";
import { AlertIcon, CheckIcon, ClockIcon, LockIcon, ShieldIcon } from "@/components/ui/Icons";
import { compact, hasErrors, type Errors } from "@/features/auth/validation";
import { NEXT_STEPS, documentTypeLabel } from "@/features/verification/status";
import {
  formatBytes,
  validateCountry,
  validateDob,
  validateDocumentNumber,
  validateFile,
  validateLegalName,
  validateVerificationPhone,
} from "@/features/verification/validation";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { errorMessage, isServiceError } from "@/services/errors";
import { verificationService } from "@/services/verification";
import type { CustomerVerification, CustomerVerificationResponse, DocumentSide, VerificationInput, VerificationPolicy } from "@/types/verification";
import { DocumentPreview } from "@/components/verification/DocumentPreview";
import { ErrorBlock, LoadingBlock, PageHeader, Skeleton, panel } from "../States";
import { FileUpload } from "./FileUpload";
import { VerificationBadge } from "./VerificationBadge";

type Field = "fullLegalName" | "dateOfBirth" | "country" | "phone" | "documentType" | "documentNumber" | "front" | "back";

const FIELD_FOR_SERVER_MESSAGE: Array<[RegExp, Field]> = [
  [/legal name/i, "fullLegalName"],
  [/date of birth|years old/i, "dateOfBirth"],
  [/country/i, "country"],
  [/phone/i, "phone"],
  [/document number/i, "documentNumber"],
  [/document type/i, "documentType"],
  [/front/i, "front"],
  [/back/i, "back"],
];

/** Largest date of birth that satisfies the minimum age, for the date picker's `max`. */
function latestDob(minAge: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().slice(0, 10);
}

// -------------------------------------------------------------------------------------------- status

function StatusPanel({ v, justSubmitted }: { v: CustomerVerification; justSubmitted: boolean }) {
  const steps = NEXT_STEPS[v.status];
  const tone =
    v.status === "approved"
      ? "bg-[#1E6B45]"
      : v.status === "pending_review"
        ? "bg-gold-500"
        : v.status === "not_submitted"
          ? "bg-navy-900"
          : "bg-[#B3261E]";
  const Icon = v.status === "approved" ? CheckIcon : v.status === "pending_review" ? ClockIcon : v.status === "not_submitted" ? ShieldIcon : AlertIcon;

  return (
    <section aria-labelledby="verification-status" className={cn(panel, "relative overflow-hidden p-5 sm:p-7")}>
      <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", tone)} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <span aria-hidden="true" className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white", tone, v.status === "pending_review" && "text-navy-950")}>
            <Icon width={22} height={22} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted">Verification status</p>
            <h2 id="verification-status" className="mt-0.5 text-lg font-semibold text-navy-900">
              {steps.title}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-navy-700">{steps.text}</p>
          </div>
        </div>
        <VerificationBadge status={v.status} className="self-start" />
      </div>

      {justSubmitted && v.status === "pending_review" ? (
        <div role="status" className="mt-5 rounded-xl border border-[#1E6B45]/25 bg-[#E7F4EC] p-4 text-sm text-[#14543A]">
          <p className="flex items-center gap-2 font-semibold">
            <CheckIcon width={18} height={18} /> Thank you, your verification has been submitted.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-9">
            <li>Our team reviews your details and documents.</li>
            <li>We email you as soon as there is a decision, and the status here updates too.</li>
            <li>Once approved, you can reserve any available car.</li>
          </ol>
        </div>
      ) : null}

      {v.reason && (v.status === "rejected" || v.status === "resubmission_required") ? (
        <div role="alert" className="mt-5 rounded-xl border border-[#B3261E]/25 bg-[#FBEAE9] p-4 text-sm text-[#8E1D17]">
          <p className="font-semibold">{v.status === "rejected" ? "Reason from our team" : "What we need from you"}</p>
          <p className="mt-1 whitespace-pre-line break-words">{v.reason}</p>
        </div>
      ) : null}

      <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-xs text-muted">
        {v.submittedAt ? (
          <div>
            <dt className="inline font-medium">Submitted </dt>
            <dd className="inline text-navy-900">{formatIsoDate(v.submittedAt)}</dd>
          </div>
        ) : null}
        {v.reviewedAt ? (
          <div>
            <dt className="inline font-medium">Reviewed </dt>
            <dd className="inline text-navy-900">{formatIsoDate(v.reviewedAt)}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function SubmittedSummary({ v, policy }: { v: CustomerVerification; policy: VerificationPolicy }) {
  if (!v.details) return null;
  const d = v.details;
  const country = policy.countries.find((c) => c.code === d.country)?.name ?? d.country;
  const row = (label: string, value: string) => (
    <div className="py-3">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-navy-900">{value}</dd>
    </div>
  );
  return (
    <section aria-labelledby="submitted-heading" className={cn(panel, "p-5 sm:p-7")}>
      <h2 id="submitted-heading" className="text-lg font-semibold text-navy-900">
        What you submitted
      </h2>
      <dl className="mt-2 grid divide-y divide-navy-900/10 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
        {row("Full legal name", d.fullLegalName)}
        {row("Date of birth", formatIsoDate(d.dateOfBirth))}
        {row("Country of residence", country)}
        {row("Phone number", d.phone)}
        {row("Document", documentTypeLabel(d.documentType, policy.documentTypes))}
        {d.documentNumberMasked ? row("Document number", d.documentNumberMasked) : null}
      </dl>

      <div className="mt-4 border-t border-navy-900/10 pt-4">
        {v.documentsPurged ? (
          <p className="flex items-start gap-2 text-sm text-muted">
            <LockIcon width={16} height={16} className="mt-0.5 shrink-0" />
            Your document images were deleted from our systems after review, as our retention policy requires.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {v.documents.map((doc) => (
              <div key={doc.side}>
                <p className="mb-2 text-sm font-medium text-navy-900">
                  {doc.side === "front" ? "Front" : "Back"} <span className="font-normal text-muted">· {formatBytes(doc.sizeBytes)}</span>
                </p>
                <DocumentPreview label={`${doc.side} of your document`} mimeType={doc.mimeType} load={() => verificationService.document(doc.side)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------- form

function VerificationForm({
  data,
  onDone,
}: {
  data: CustomerVerificationResponse;
  onDone: (v: CustomerVerification) => void;
}) {
  const { verification: v, policy } = data;
  const resubmitting = v.status !== "not_submitted";
  const existing = (side: DocumentSide) => v.documents.find((d) => d.side === side);

  const [values, setValues] = useState({
    fullLegalName: v.details?.fullLegalName ?? v.profile.name,
    dateOfBirth: v.details?.dateOfBirth ?? "",
    country: v.details?.country ?? "",
    phone: v.details?.phone ?? v.profile.phone ?? "",
    documentType: v.details?.documentType ?? (policy.documentTypes.length === 1 ? policy.documentTypes[0].type : ""),
    documentNumber: "",
  });
  const [files, setFiles] = useState<{ front: File | null; back: File | null }>({ front: null, back: null });
  const [errors, setErrors] = useState<Errors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const alertRef = useRef<HTMLDivElement>(null);

  const type = useMemo(() => policy.documentTypes.find((t) => t.type === values.documentType), [policy, values.documentType]);
  const formats = policy.acceptedFormats.map((f) => f.label).join(", ");
  const fileHint = `${formats} · up to ${policy.maxFileSizeMb} MB`;

  const set = (field: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setValues((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  function pick(side: DocumentSide, file: File) {
    const problem = validateFile(file, policy);
    setErrors((p) => ({ ...p, [side]: problem }));
    setFiles((p) => ({ ...p, [side]: problem ? null : file }));
  }

  function validate(): Errors<Field> {
    const keepsFront = Boolean(existing("front"));
    const keepsBack = Boolean(existing("back")) && v.details?.documentType === values.documentType;
    const typeChanged = Boolean(v.details) && v.details?.documentType !== values.documentType;
    return compact<Field>({
      fullLegalName: validateLegalName(values.fullLegalName),
      dateOfBirth: validateDob(values.dateOfBirth, policy.minAge),
      country: validateCountry(values.country, policy),
      phone: validateVerificationPhone(values.phone),
      documentType: values.documentType ? undefined : "Choose the document you will upload.",
      documentNumber:
        type && type.requiresNumber && !values.documentNumber.trim() && (!resubmitting || typeChanged || !v.details?.documentNumberMasked)
          ? "Enter the document number."
          : validateDocumentNumber(values.documentNumber, type),
      front: files.front || keepsFront ? errors.front : "Upload the front of your document.",
      back: type?.requiresBack && !files.back && !keepsBack ? "Upload the back of your document." : errors.back,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(undefined);
    const found = validate();
    setErrors(found);
    if (hasErrors(found)) {
      setFormError("Please fix the highlighted fields and try again.");
      return;
    }

    const input: VerificationInput = {
      fullLegalName: values.fullLegalName,
      dateOfBirth: values.dateOfBirth,
      country: values.country,
      phone: values.phone,
      documentType: values.documentType,
      documentNumber: values.documentNumber,
      front: files.front ?? undefined,
      back: type?.requiresBack ? (files.back ?? undefined) : undefined,
    };

    setBusy(true);
    setProgress(0);
    try {
      const result = resubmitting ? await verificationService.resubmit(input, setProgress) : await verificationService.submit(input, setProgress);
      onDone(result);
    } catch (err) {
      const message = errorMessage(err);
      const match = isServiceError(err) && err.code === "invalid_input" ? FIELD_FOR_SERVER_MESSAGE.find(([re]) => re.test(message)) : undefined;
      if (match) setErrors((p) => ({ ...p, [match[1]]: message }));
      setFormError(message);
      requestAnimationFrame(() => alertRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy} className={cn(panel, "p-5 sm:p-7")}>
      <h2 className="text-lg font-semibold text-navy-900">{resubmitting ? "Update and resubmit" : "Your details"}</h2>
      <p className="mt-1 text-sm text-muted">We only ask for what we need to confirm who you are. Everything must match your document.</p>

      <div ref={alertRef} className="mt-4 empty:hidden">
        {formError ? <FormAlert>{formError}</FormAlert> : null}
      </div>

      {/* A. Personal information */}
      <fieldset disabled={busy} className="mt-6 min-w-0">
        <legend className="mb-3 flex items-center gap-2 text-base font-semibold text-navy-900">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-gold-500" /> Personal information
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Full legal name"
            name="fullLegalName"
            autoComplete="name"
            value={values.fullLegalName}
            error={errors.fullLegalName}
            onChange={set("fullLegalName")}
            hint="Exactly as it appears on your document."
            className="sm:col-span-2"
          />
          <FormField
            label="Date of birth"
            type="date"
            name="dateOfBirth"
            autoComplete="bday"
            max={latestDob(policy.minAge)}
            value={values.dateOfBirth}
            error={errors.dateOfBirth}
            onChange={set("dateOfBirth")}
            hint={`You must be at least ${policy.minAge}.`}
          />
          <SelectField label="Country of residence" name="country" autoComplete="country" value={values.country} error={errors.country} onChange={set("country")}>
            <option value="">Select a country</option>
            {policy.countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <FormField
            label="Phone number"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            error={errors.phone}
            onChange={set("phone")}
            hint={v.profile.phone ? "Taken from your account. Change it if it's out of date." : undefined}
          />
        </div>
      </fieldset>

      {/* B. Identity document */}
      <fieldset disabled={busy} className="mt-8 min-w-0">
        <legend className="mb-3 flex items-center gap-2 text-base font-semibold text-navy-900">
          <span aria-hidden="true" className="h-1 w-6 rounded-full bg-gold-500" /> Identity document
        </legend>

        <div role="radiogroup" aria-label="Document type" aria-describedby={errors.documentType ? "doc-type-error" : undefined} className="grid gap-3 sm:grid-cols-3">
          {policy.documentTypes.map((t) => {
            const selected = values.documentType === t.type;
            return (
              <label
                key={t.type}
                className={cn(
                  "flex min-h-[4.5rem] cursor-pointer flex-col justify-center rounded-xl border p-3.5 text-sm transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold-500",
                  selected ? "border-navy-900 bg-navy-900/[0.04] shadow-card" : "border-navy-900/20 hover:border-navy-900/40",
                )}
              >
                <input
                  type="radio"
                  name="documentType"
                  value={t.type}
                  checked={selected}
                  onChange={() => {
                    setValues((p) => ({ ...p, documentType: t.type }));
                    setErrors((p) => ({ ...p, documentType: undefined, documentNumber: undefined, back: undefined }));
                  }}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2 font-semibold text-navy-900">
                  {t.label}
                  {selected ? <CheckIcon width={16} height={16} className="text-gold-700" /> : null}
                </span>
                <span className="mt-0.5 text-xs text-muted">{t.requiresBack ? "Front and back" : "Photo page only"}</span>
              </label>
            );
          })}
        </div>
        {errors.documentType ? (
          <p id="doc-type-error" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-[#8E1D17]">
            <AlertIcon width={14} height={14} className="mt-px shrink-0" />
            {errors.documentType}
          </p>
        ) : null}

        {type ? (
          <div className="mt-5 space-y-5">
            {type.requiresNumber ? (
              <FormField
                label="Document number"
                name="documentNumber"
                autoComplete="off"
                value={values.documentNumber}
                error={errors.documentNumber}
                onChange={set("documentNumber")}
                hint={
                  resubmitting && v.details?.documentType === values.documentType && v.details.documentNumberMasked
                    ? `On file: ${v.details.documentNumberMasked}. Leave this blank to keep it.`
                    : "Shown only to our verification team."
                }
                className="sm:max-w-sm"
              />
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <FileUpload
                label={type.requiresBack ? "Front of document" : "Document photo page"}
                hint={fileHint}
                file={files.front}
                existing={existing("front")}
                error={errors.front}
                disabled={busy}
                onPick={(f) => pick("front", f)}
                onClear={() => setFiles((p) => ({ ...p, front: null }))}
              />
              {type.requiresBack ? (
                <FileUpload
                  label="Back of document"
                  hint={fileHint}
                  file={files.back}
                  existing={v.details?.documentType === values.documentType ? existing("back") : undefined}
                  error={errors.back}
                  disabled={busy}
                  onPick={(f) => pick("back", f)}
                  onClear={() => setFiles((p) => ({ ...p, back: null }))}
                />
              ) : null}
            </div>

            <ul className="space-y-1 text-xs leading-relaxed text-muted">
              <li>Use a clear photo or scan of the original document, not a photocopy.</li>
              <li>All four corners must be visible, and the text must be sharp and readable, with no glare.</li>
              <li>The document must be valid (not expired). Accepted formats: {formats}, up to {policy.maxFileSizeMb} MB each.</li>
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">Choose a document type to continue.</p>
        )}
      </fieldset>

      <p className="mt-6 flex items-start gap-2 rounded-lg bg-navy-900/[0.04] px-4 py-3 text-xs leading-relaxed text-navy-700">
        <LockIcon width={16} height={16} className="mt-px shrink-0 text-gold-700" />
        Your documents are stored privately and are only visible to you and to authorized verification staff. They are deleted after review under our retention policy.
      </p>

      {busy ? (
        <div className="mt-5" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-xs font-medium text-navy-900">
            <span>{progress < 100 ? "Uploading your documents…" : "Checking your documents…"}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy-900/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Upload progress">
            <div className="h-full rounded-full bg-gold-500 transition-[width] duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={busy}>
          {busy ? "Submitting…" : resubmitting ? "Resubmit for review" : "Submit for review"}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------------------------- page

export function VerificationView() {
  const { data, loading, error, reload, setData } = useAsync(() => verificationService.get(), []);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (justSubmitted) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [justSubmitted]);

  return (
    <div ref={topRef} className="space-y-6">
      <PageHeader title="Identity verification" description="Verify your identity once, then reserve cars with confidence. This protects you and our partners." />

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading || !data ? (
        <>
          <LoadingBlock label="Loading your verification" rows={1} />
          <Skeleton className="h-64 rounded-2xl" />
        </>
      ) : (
        <>
          <StatusPanel v={data.verification} justSubmitted={justSubmitted} />
          {data.verification.canSubmit ? (
            <VerificationForm
              key={`${data.verification.status}-${data.verification.submittedAt ?? "new"}`}
              data={data}
              onDone={(verification) => {
                setData({ ...data, verification });
                setJustSubmitted(true);
              }}
            />
          ) : (
            <SubmittedSummary v={data.verification} policy={data.policy} />
          )}
          {data.verification.status === "approved" ? (
            <div className="flex">
              <Button href="/cars">Browse cars</Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
