import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, LogOutIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import { initialsOf } from '../../lib/initials';

export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: IconComponent;
  end?: boolean;
  /** Items waiting for the user, shown as a badge. */
  count?: number;
}

interface WorkspaceShellProps {
  /** e.g. "Exporter workspace" — names who this workspace is for. */
  audience: string;
  homeHref: string;
  navItems: WorkspaceNavItem[];
  /** Where signing out lands — the workspace's sign-in page. */
  signInHref: string;
  onSignOut: () => void;
  identity: { name: string; detail: React.ReactNode; badge: React.ReactNode };
  banner?: React.ReactNode;
  title: string;
  intro: string;
  children: React.ReactNode;
}

/** Shared frame for the exporter and buyer workspaces: mobile-first and built toward WCAG
 * 2.1 AA (PRD §7.5) — skip link, labelled landmarks, 44px targets, body text gray-600+.
 * Always light, like the console; `color-scheme` stops the public site's dark default
 * from bleeding into native form controls. */
export function WorkspaceShell({
  audience,
  homeHref,
  navItems,
  signInHref,
  onSignOut,
  identity,
  banner,
  title,
  intro,
  children
}: WorkspaceShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 [color-scheme:light]">
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-3 focus:py-2 focus:text-[13px] focus:text-white">

        Skip to content
      </a>

      {/* Stays pinned while scrolling. On phones the section tabs become a fixed bottom bar — so no
          backdrop-filter on the header, which would make that bar position against the header. */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-2.5 md:pb-0 md:pt-3">
          <Link
            to={homeHref}
            className="flex items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">

            <img src="/brand/nseg-logo-color.svg" alt="NSEG — Nigeria Service Export Gateway" className="h-9 w-auto" />
            <span className="hidden border-l border-gray-200 pl-3 text-[12.5px] font-medium text-gray-700 sm:block">{audience}</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-[12.5px] font-medium text-gray-900">{identity.name}</span>
              <span className="block text-[11.5px] text-gray-600">Signed in</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                navigate(signInHref);
              }}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-3.5 text-[13px] font-medium text-gray-800 hover:border-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">

              <LogOutIcon className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>

        <nav
          aria-label="Workspace sections"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)] md:static md:mx-auto md:mt-1 md:max-w-4xl md:border-0 md:bg-transparent md:px-4 md:pb-0 md:shadow-none">

          <ul className="grid md:flex md:gap-1" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
            {navItems.map(({ to, label, icon: Icon, end, count }) =>
            <li key={to} className="relative">
                <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                `flex min-h-[60px] flex-col items-center justify-center gap-1 whitespace-nowrap border-t-2 px-1 text-[11.5px] font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gray-900 md:min-h-[44px] md:flex-row md:gap-1.5 md:border-b-2 md:border-t-0 md:px-3 md:text-[13.5px] ${
                isActive ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`
                }>

                  <Icon className="h-5 w-5 md:h-4 md:w-4" aria-hidden="true" />
                  {label}
                  {Boolean(count) &&
                  <span className="absolute left-1/2 top-2 ml-2 rounded-full bg-gray-900 px-1.5 py-0.5 text-[10.5px] font-semibold leading-none text-white md:static md:ml-0 md:text-[11px]">
                      {count}
                      <span className="sr-only"> waiting</span>
                    </span>
                  }
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </header>

      <main id="workspace-main" className="mx-auto max-w-4xl px-4 pb-10 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[12px] font-semibold text-white"
            aria-hidden="true">

            {initialsOf(identity.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-gray-900">{identity.name}</p>
            <p className="text-[12px] text-gray-600">{identity.detail}</p>
          </div>
          {identity.badge}
        </div>

        {banner}

        <h1 className="mt-6 font-display text-[24px] font-semibold tracking-[-0.01em] text-gray-900 sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-gray-600">{intro}</p>

        <div className="mt-6">{children}</div>
      </main>

      <footer className="mx-auto max-w-4xl px-4 pb-28 md:pb-10">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900">

          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to the Service Export Gateway
        </Link>
      </footer>
    </div>);

}
