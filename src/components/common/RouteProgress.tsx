import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteProgressValue {
  start: () => void;
  done: () => void;
}

const RouteProgressContext = createContext<RouteProgressValue | null>(null);

/** Local pages open in a few milliseconds, which is too fast to read as anything. The bar
 * stays up for at least this long so opening a page is always legible — the same reason the
 * prototype's buttons use a simulated delay. */
const MIN_VISIBLE_MS = 520;

/**
 * A thin progress bar across the top of the window while a page opens. It creeps forward while
 * the page's code downloads and its data renders, then fills and fades once the page is on
 * screen — so a slow page shows progress and a fast one shows nothing at all.
 */
export function RouteProgressProvider({ children }: {children: React.ReactNode;}) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const creepTimer = useRef<number>();
  const hideTimer = useRef<number>();
  const finishTimer = useRef<number>();
  const startedAt = useRef(0);

  const clearTimers = () => {
    window.clearInterval(creepTimer.current);
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(finishTimer.current);
  };

  const start = useCallback(() => {
    clearTimers();
    startedAt.current = Date.now();
    setProgress(14);
    setVisible(true);
    // Creep toward — never reaching — the end, so the bar keeps moving while the page loads.
    creepTimer.current = window.setInterval(() => {
      setProgress((current) => (current >= 88 ? current : current + (92 - current) * 0.22));
    }, 120);
  }, []);

  const done = useCallback(() => {
    const finish = () => {
      window.clearInterval(creepTimer.current);
      setProgress(100);
      hideTimer.current = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 320);
    };
    const elapsed = Date.now() - startedAt.current;
    window.clearTimeout(finishTimer.current);
    if (elapsed >= MIN_VISIBLE_MS) finish();else
    finishTimer.current = window.setTimeout(finish, MIN_VISIBLE_MS - elapsed);
  }, []);

  useEffect(() => clearTimers, []);

  const value = useMemo(() => ({ start, done }), [start, done]);

  return (
    <RouteProgressContext.Provider value={value}>
      <div
        role="progressbar"
        aria-label="Page loading"
        aria-hidden={!visible}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={visible ? Math.round(progress) : undefined}
        className={`route-progress ${visible ? 'route-progress--on' : ''}`}>

        <span className="route-progress-bar" style={{ width: `${progress}%` }}>
          <span className="route-progress-glow" />
        </span>
      </div>
      {children}
    </RouteProgressContext.Provider>);

}

function useRouteProgress(): RouteProgressValue {
  return useContext(RouteProgressContext) ?? { start: () => {}, done: () => {} };
}

/** Starts the bar whenever the address changes. Sits outside the Suspense boundary. */
export function RouteProgressStarter() {
  const { pathname } = useLocation();
  const { start } = useRouteProgress();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    start();
  }, [pathname, start]);

  return null;
}

/** Finishes the bar. Rendered inside the Suspense boundary, so its effect only runs once the
 * new page's code has arrived and the page has actually rendered. */
export function RouteProgressFinisher() {
  const { pathname } = useLocation();
  const { done } = useRouteProgress();

  useEffect(() => {
    done();
  }, [pathname, done]);

  return null;
}
