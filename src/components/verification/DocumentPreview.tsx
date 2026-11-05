"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertIcon, EyeIcon, EyeOffIcon } from "@/components/ui/Icons";
import { errorMessage } from "@/services/errors";

const SHOWABLE = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
/** A document is hidden again after this long, so an unattended screen does not keep showing an ID. */
const AUTO_HIDE_MS = 5 * 60 * 1000;

type State = { status: "idle" } | { status: "loading" } | { status: "error"; message: string } | { status: "ready"; url: string; mime: string };

/**
 * Shows one protected identity document on demand.
 *
 * The file is fetched through an authenticated API call (`load`), shown from an in-memory object URL and never
 * given a permanent address. The URL is revoked when the document is hidden, after five minutes, and on unmount.
 * `mimeType` (from the server's metadata) decides how it is shown, so nothing is rendered as an unexpected type.
 */
export function DocumentPreview({ label, mimeType, load }: { label: string; mimeType: string; load: () => Promise<Blob> }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const urlRef = useRef<string>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const release = useCallback(() => {
    clearTimeout(timer.current);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = undefined;
  }, []);

  useEffect(() => release, [release]);

  const hide = useCallback(() => {
    release();
    setState({ status: "idle" });
  }, [release]);

  async function show() {
    if (!SHOWABLE.has(mimeType)) {
      setState({ status: "error", message: "This file type can't be previewed." });
      return;
    }
    setState({ status: "loading" });
    try {
      const blob = await load();
      release();
      // Re-type the blob from the server's metadata rather than trusting whatever came back.
      const url = URL.createObjectURL(new Blob([blob], { type: mimeType }));
      urlRef.current = url;
      timer.current = setTimeout(hide, AUTO_HIDE_MS);
      setState({ status: "ready", url, mime: mimeType });
    } catch (e) {
      setState({ status: "error", message: errorMessage(e) });
    }
  }

  return (
    <div>
      {state.status === "ready" ? (
        <div className="space-y-3">
          {state.mime === "application/pdf" ? (
            <p className="rounded-lg border border-navy-900/10 bg-navy-900/[0.03] p-4 text-sm text-navy-900">
              PDF document.{" "}
              <a href={state.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-gold-700">
                Open in a new tab
              </a>
            </p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.url} alt={label} className="max-h-96 w-full rounded-lg border border-navy-900/10 bg-navy-900/[0.03] object-contain" />
          )}
          <Button variant="outline-navy" onClick={hide}>
            <EyeOffIcon width={16} height={16} /> Hide {label.toLowerCase()}
          </Button>
        </div>
      ) : (
        <Button variant="outline-navy" onClick={show} disabled={state.status === "loading"}>
          <EyeIcon width={16} height={16} /> {state.status === "loading" ? "Loading…" : `View ${label.toLowerCase()}`}
        </Button>
      )}
      {state.status === "error" ? (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#8E1D17]">
          <AlertIcon width={14} height={14} className="mt-px shrink-0" />
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
