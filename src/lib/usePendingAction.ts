import { useEffect, useRef, useState } from 'react';

/** How long simulated server calls take. Long enough to see the loading state, short enough
 * not to slow a review down. */
export const SIMULATED_LATENCY_MS = 650;

/**
 * Runs an action after a simulated network delay, tracking which one is in flight so its
 * button can show a spinner and ignore repeat clicks. The prototype has no backend; this keeps
 * the loading states honest to how the real Gateway will behave.
 */
export function usePendingAction() {
  const [pending, setPending] = useState<string | null>(null);
  const mounted = useRef(true);
  const inFlight = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = (key: string, action: () => void, delay = SIMULATED_LATENCY_MS) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(key);
    window.setTimeout(() => {
      inFlight.current = false;
      if (mounted.current) setPending(null);
      action();
    }, delay);
  };

  return { pending, run, isPending: (key: string) => pending === key };
}
