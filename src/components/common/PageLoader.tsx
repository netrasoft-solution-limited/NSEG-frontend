import React from 'react';
import { useLocation } from 'react-router-dom';
import { Spinner } from './Spinner';

/** Shown while a route's code downloads. Matches the surface it's loading into, so the
 * console and workspaces don't flash the public site's dark ground (and vice versa). */
export function PageLoader() {
  const { pathname } = useLocation();
  const isAuth = /^\/(workspace|buyer)\/(sign-in|register)/.test(pathname);
  const isLightApp = !isAuth && /^\/(console|workspace|buyer)/.test(pathname);

  const surface = isAuth ?
  `auth-backdrop ${pathname.startsWith('/buyer') ? 'auth-backdrop--buyer' : ''} text-white` :
  isLightApp ?
  'bg-gray-50 text-gray-700' :
  'text-chalk-muted';

  return (
    <div role="status" aria-live="polite" className={`flex min-h-screen w-full flex-col items-center justify-center gap-5 ${surface}`}>
      <div className="relative flex h-20 w-20 items-center justify-center">
        <Spinner className="absolute inset-0 h-20 w-20 text-gate" />
        <img
          src={isLightApp ? '/brand/nseg-mark-color.svg' : '/brand/nseg-mark-white.svg'}
          alt=""
          className="h-10 w-auto" />

      </div>
      <p className="text-[13px] font-medium">Loading…</p>
    </div>);

}
