"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Fetch on mount without synchronous setState in the effect body. */
export function useMountedFetch(run: () => Promise<void>, depsKey: string) {
  const runRef = useRef(run);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    runRef.current = run;
  }, [run]);

  const retry = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        if (cancelled) return;
        await runRef.current();
      })();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [depsKey, tick]);

  return { retry };
}
