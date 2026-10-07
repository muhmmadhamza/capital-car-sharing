"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { errorMessage } from "@/services/errors";

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => void;
  setData: (data: T) => void;
}

/** Runs `load` on mount and whenever `deps` change. Ignores results that arrive after unmount. */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    loadRef
      .current()
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}
