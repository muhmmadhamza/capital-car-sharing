"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/FormControls";
import { DocumentPreview } from "@/components/verification/DocumentPreview";
import { DECISION_LABELS, EVENT_LABELS, VERIFICATION_LABELS, documentTypeLabel, verificationTone } from "@/features/verification/status";
import { formatBytes } from "@/features/verification/validation";
import { useAsync } from "@/hooks/useAsync";
import { formatIsoDate } from "@/lib/date";
import { getVerification, getVerificationDocument, reviewVerification } from "@/services/admin/verification.service";
import { errorMessage } from "@/services/errors";
import type { AdminVerificationDetail, ReviewDecision } from "@/types/verification";
import { BackLink, DangerButton, ErrorState, LoadingRows, Meta, Modal, PageHeader, StatusPill, panel, useAdminToast } from "../ui";

const REASON_MAX = 500;
const PROMPTS: Record<Exclude<ReviewDecision, "approved">, { title: string; label: string; hint: string; confirm: string }> = {
  rejected: {
    title: "Reject this verification",
    label: "Reason for rejection",
    hint: "The customer will see and be emailed this text. Do not include document numbers or other sensitive details.",
    confirm: "Reject",
  },
  resubmission_required: {
    title: "Request resubmission",
    label: "What the customer needs to fix",
    hint: "The customer will see and be emailed these instructions. Be specific, and keep sensitive details out.",
    confirm: "Request resubmission",
  },
};

function ReasonModal({ kind, onClose, onSubmit }: { kind: keyof typeof PROMPTS; onClose: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const p = PROMPTS[kind];
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return setError("Write a message for the customer.");
    setBusy(true);
    try {
      await onSubmit(reason.trim());
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={p.title} onClose={onClose} busy={busy}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {error ? <FormAlert>{error}</FormAlert> : null}
        <TextareaField label={p.label} value={reason} maxLength={REASON_MAX} onChange={(e) => setReason(e.target.value)} hint={`${p.hint} (${reason.length}/${REASON_MAX})`} disabled={busy} />
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline-navy" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : p.confirm}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function VerificationDetailsView({ id }: { id: string }) {
  const { data, loading, error, reload, setData } = useAsync(() => getVerification(id), [id]);
  const notify = useAdminToast();
  const [asking, setAsking] = useState<keyof typeof PROMPTS>();
  const [busy, setBusy] = useState(false);

  const back = <BackLink href="/admin/verifications">All verifications</BackLink>;
  if (loading && !data) return <><PageHeader title="Verification" back={back} /><LoadingRows label="Loading verification" rows={4} /></>;
  if (error && !data) return <><PageHeader title="Verification" back={back} /><ErrorState message={error} onRetry={reload} /></>;
  if (!data) return null;
  const v: AdminVerificationDetail = data;

  async function decide(status: ReviewDecision, reason?: string) {
    const updated = await reviewVerification(id, status, reason);
    setData(updated);
    notify(`Verification ${VERIFICATION_LABELS[updated.status].toLowerCase()}. The customer is notified by email if email is configured.`);
  }

  async function approve() {
    setBusy(true);
    try {
      await decide("approved");
    } catch (err) {
      notify(errorMessage(err), "error");
      reload();
    } finally {
      setBusy(false);
    }
  }

  const can = (a: ReviewDecision) => v.allowedActions.includes(a);
  const d = v.details;

  return (
    <>
      <PageHeader
        title={v.customer.name}
        description={v.customer.email}
        back={back}
        action={<StatusPill tone={verificationTone(v.status)}>{VERIFICATION_LABELS[v.status]}</StatusPill>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className={`${panel} p-5 sm:p-7`} aria-labelledby="submitted-info">
            <h2 id="submitted-info" className="text-lg font-semibold text-navy-900">Submitted information</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <Meta label="Full legal name" value={d.fullLegalName} />
              <Meta label="Date of birth" value={formatIsoDate(d.dateOfBirth)} />
              <Meta label="Country of residence" value={d.country} />
              <Meta label="Phone" value={d.phone} />
              <Meta label="Document type" value={documentTypeLabel(d.documentType)} />
              <Meta label="Document number" value={d.documentNumber ?? (d.documentNumberUnreadable ? "Unreadable (encryption key changed)" : "Not provided")} />
              <Meta label="Submitted" value={formatIsoDate(v.submittedAt)} />
              <Meta label="Reviewed" value={v.reviewedAt ? `${formatIsoDate(v.reviewedAt)}${v.reviewedBy ? ` by ${v.reviewedBy}` : ""}` : "Not yet"} />
            </dl>
            {v.reason ? (
              <p className="mt-5 rounded-lg border border-gold-700/30 bg-gold-500/10 p-3 text-sm text-navy-900">
                <span className="font-semibold">Message to customer: </span>
                {v.reason}
              </p>
            ) : null}
          </section>

          <section className={`${panel} p-5 sm:p-7`} aria-labelledby="documents">
            <h2 id="documents" className="text-lg font-semibold text-navy-900">Documents</h2>
            <p className="mt-1 text-xs text-muted">Opened through a secure, logged connection. Each view is recorded in the history.</p>
            {v.documentsPurged ? (
              <p className="mt-4 text-sm text-muted">The files were deleted under the retention policy.</p>
            ) : v.documents.length === 0 ? (
              <p className="mt-4 text-sm text-muted">No documents on record.</p>
            ) : (
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {v.documents.map((doc) => (
                  <div key={doc.side}>
                    <p className="mb-2 text-sm font-medium text-navy-900">
                      {doc.side === "front" ? "Front" : "Back"} <span className="font-normal text-muted">· {formatBytes(doc.sizeBytes)}</span>
                    </p>
                    <DocumentPreview label={`${doc.side} of document`} mimeType={doc.mimeType} load={() => getVerificationDocument(id, doc.side)} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${panel} p-5`} aria-labelledby="decision">
            <h2 id="decision" className="text-lg font-semibold text-navy-900">Decision</h2>
            {v.allowedActions.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Waiting for the customer to correct and resubmit. No action is available.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {can("approved") ? (
                  <Button onClick={approve} disabled={busy}>
                    {busy ? "Saving…" : v.status === "approved" ? DECISION_LABELS.approved : DECISION_LABELS.approved}
                  </Button>
                ) : null}
                {can("resubmission_required") ? (
                  <Button variant="outline-navy" onClick={() => setAsking("resubmission_required")} disabled={busy}>
                    {DECISION_LABELS.resubmission_required}
                  </Button>
                ) : null}
                {can("rejected") ? <DangerButton onClick={() => setAsking("rejected")} disabled={busy}>{v.status === "approved" ? "Revoke approval" : DECISION_LABELS.rejected}</DangerButton> : null}
              </div>
            )}
          </section>

          <section className={`${panel} p-5`} aria-labelledby="history">
            <h2 id="history" className="text-lg font-semibold text-navy-900">History</h2>
            <ol className="mt-4 space-y-4">
              {v.history.map((h) => (
                <li key={h.id} className="border-l-2 border-gold-500 pl-3 text-sm">
                  <p className="font-semibold text-navy-900">{EVENT_LABELS[h.event]}</p>
                  <p className="text-xs text-muted">
                    {new Date(h.createdAt).toLocaleString()} · {h.actorName ?? h.actorRole ?? "System"}
                  </p>
                  {h.reason && h.event !== "document_viewed" ? <p className="mt-1 break-words text-navy-700">{h.reason}</p> : null}
                  {h.reason && h.event === "document_viewed" ? <p className="text-xs text-muted">{h.reason} side</p> : null}
                  {h.customerNotified !== null ? (
                    <p className="text-xs text-muted">{h.customerNotified ? "Email accepted by the mail server" : "Email not sent (mail not configured or failed)"}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {asking ? (
        <ReasonModal
          kind={asking}
          onClose={() => setAsking(undefined)}
          onSubmit={async (reason) => {
            await decide(asking, reason);
            setAsking(undefined);
          }}
        />
      ) : null}
    </>
  );
}
