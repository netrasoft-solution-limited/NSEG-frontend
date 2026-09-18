import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon, LogOutIcon, MenuIcon, UserRoundIcon, XIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import { initialsOf } from '../../lib/initials';
import { Starfield } from './Starfield';
import { PageTransition } from '../common/PageTransition';

export interface WorkspaceNavItem {
  to: string;
  label: string;
  icon: IconComponent;
  end?: boolean;
  /** Items waiting for the user, shown as a badge. */
  count?: number;
  /** Sidebar group heading this item sits under, e.g. "Opportunities". */
  group?: string;
}

/** Sub-sections of one page, shown as tabs under the page title. */
export interface WorkspaceTab {
  to: string;
  label: string;
  end?: boolean;
}

export type WorkspaceVariant = 'exporter' | 'buyer';

interface WorkspaceShellProps {
  /** e.g. "Exporter workspace" — names who this workspace is for. */
  audience: string;
  /** Sets the accent: green for exporters, gold for buyers (matches sign-in). */
  variant: WorkspaceVariant;
  homeHref: string;
  navItems: WorkspaceNavItem[];
  /** Where signing out lands — the workspace's sign-in page. */
  signInHref: string;
  onSignOut: () => void;
  identity: {
    name: string;
    detail: React.ReactNode;
    badge: React.ReactNode;
    /** The organisation this person acts for, shown under their name. */
    role?: string;
    /** Account record shown in the account panel. */
    facts?: {label: string;value: React.ReactNode;}[];
  };
  banner?: React.ReactNode;
  /** Short label for the header bar, e.g. "Overview". Defaults to the page title. */
  section?: string;
  /** Where "Your profile" in the account menu goes, when the workspace has such a page. */
  profileHref?: string;
  title: string;
  intro: string;
  /** Buttons beside the page title, e.g. "Place a requirement". */
  actions?: React.ReactNode;
  tabs?: WorkspaceTab[];
  children: React.ReactNode;
}

interface SidebarProps {
  audience: string;
  variant: WorkspaceVariant;
  homeHref: string;
  navItems: WorkspaceNavItem[];
  onSignOut: () => void;
  onNavigate?: () => void;
  headerAction?: React.ReactNode;
}

/** The workspace navigation column: brand, sections, and the signed-in person with sign out. */
function Sidebar({ audience, variant, homeHref, navItems, onNavigate, headerAction }: SidebarProps) {
  return (
    <div
      className={`auth-backdrop auth-galaxy relative isolate flex h-full flex-col overflow-hidden text-white ${
      variant === 'buyer' ? 'auth-backdrop--buyer' : ''}`
      }>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="auth-aurora absolute inset-0" />
        <Starfield accent={variant === 'exporter' ? '#4fb68f' : '#e0b25c'} />
      </div>

      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <Link
          to={homeHref}
          onClick={onNavigate}
          className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">

          <BrandLogo className="h-8" />
        </Link>
        {headerAction}
      </div>

      <p className="auth-eyebrow mx-5 mt-5 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
        <span className="auth-live-dot" aria-hidden="true" />
        {audience}
      </p>

      <nav aria-label="Workspace sections" className="mt-6 flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, count, group }, index) =>
          <li key={to}>
              {group && group !== navItems[index - 1]?.group &&
            <p className={`px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40 ${index > 0 ? 'pt-5' : ''}`}>
                  {group}
                </p>
            }
              <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
              `group relative flex min-h-[48px] items-center gap-3 rounded-2xl px-3 text-[14.5px] font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
              isActive ? 'text-[#0D1A15]' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`
              }>

                {({ isActive }) =>
              <>
                    {isActive &&
                <motion.span
                  layoutId={`workspace-nav-${variant}`}
                  className="absolute inset-0 rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }} />

                }
                    <span
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xl ${
                  isActive ? 'auth-avatar' : 'bg-white/[0.06] text-white/75 group-hover:text-white'}`
                  }>

                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <span className="relative flex-1">{label}</span>
                    {Boolean(count) &&
                <span
                  className={`relative min-w-[22px] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none ${
                  isActive ? 'bg-[#0D1A15] text-white' : 'auth-count'}`
                  }>

                        {count}
                        <span className="sr-only"> waiting</span>
                      </span>
                }
                  </>
              }
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-3">
        <Link
          to="/"
          className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-[12.5px] font-medium text-white/55 hover:text-white">

          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Gateway home
        </Link>
      </div>
    </div>);

}

/** The account chip in the top right, and the panel it opens: who is signed in, the
 * organisation they act for, what has been verified, and signing out. A side panel rather than
 * a dropdown, so the whole account record fits without crowding the header. */
function AccountPanel({
  identity,
  variant,
  profileHref,
  onSignOut





}: {identity: WorkspaceShellProps['identity'];variant: WorkspaceVariant;profileHref?: string;onSignOut: () => void;}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="account-panel"
        className="profile-chip flex min-h-[44px] items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5">

        <span className="profile-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold" aria-hidden="true">
          {initialsOf(identity.name)}
        </span>
        <span className="hidden max-w-[180px] text-left leading-tight sm:block">
          <span className="block truncate text-[13.5px] font-semibold text-gray-900">{identity.name}</span>
          <span className="block truncate text-[11.5px] text-gray-600">{identity.role}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        <span className="sr-only">Your account</span>
      </button>

      {createPortal(
      <AnimatePresence>
        {open &&
        <div className={`auth-theme--${variant} fixed inset-0 z-[60]`}>
            <motion.div
            className="absolute inset-0 bg-[#0A100D]/50 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true" />

            <motion.aside
            id="account-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your account"
            initial={reduced ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)]">

              <div className="profile-panel-head relative overflow-hidden px-6 pb-6 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">Your account</p>
                  <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="-mr-2 -mt-1 flex h-11 w-11 items-center justify-center rounded-full text-gray-600 hover:bg-black/5 hover:text-gray-900">

                    <XIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className="profile-avatar flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[17px] font-bold" aria-hidden="true">
                    {initialsOf(identity.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[20px] font-semibold tracking-[-0.01em] text-gray-900">
                      {identity.name}
                    </span>
                    <span className="block truncate text-[13px] text-gray-600">{identity.role}</span>
                  </span>
                </div>
                <div className="mt-4">{identity.badge}</div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Organisation</h2>
                <dl className="mt-3 divide-y divide-gray-100">
                  {(identity.facts ?? []).map((fact) =>
                <div key={fact.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5">
                      <dt className="text-[13px] text-gray-600">{fact.label}</dt>
                      <dd className="text-right text-[13.5px] font-medium text-gray-900">{fact.value}</dd>
                    </div>
                )}
                </dl>
              </div>

              <div className="space-y-2 border-t border-gray-200 px-6 py-5">
                {profileHref &&
              <Link
                to={profileHref}
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-gray-200 px-4 text-[14px] font-semibold text-gray-900 hover:border-gray-400">

                    <UserRoundIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    Your profile
                  </Link>
              }
                <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSignOut();
                }}
                className="flex min-h-[48px] w-full items-center gap-3 rounded-2xl bg-gray-900 px-4 text-[14px] font-semibold text-white hover:bg-black">

                  <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </div>
        }
      </AnimatePresence>,
      document.body
      )}
    </>);

}

/** Shared frame for the exporter and buyer workspaces, built toward WCAG 2.1 AA (PRD §7.5).
 * A pinned sidebar on desktop; on phones the same sidebar opens as a drawer from a top bar.
 * Content sits on a lightly tinted canvas in white cards so forms and data keep full contrast. */
export function WorkspaceShell({
  audience,
  variant,
  homeHref,
  navItems,
  signInHref,
  onSignOut,
  identity,
  banner,
  section,
  profileHref,
  title,
  intro,
  actions,
  tabs,
  children
}: WorkspaceShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const signOut = () => {
    onSignOut();
    navigate(signInHref);
  };

  useEffect(() => setDrawerOpen(false), [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      menuButtonRef.current?.focus();
    };
  }, [drawerOpen]);

  const pendingTotal = navItems.reduce((sum, item) => sum + (item.count ?? 0), 0);

  return (
    <div
      className={`auth-theme--${variant} workspace-canvas min-h-screen w-full text-gray-900 [color-scheme:light] ${
      variant === 'buyer' ? 'workspace-canvas--buyer' : ''}`
      }>

      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-[13px] focus:text-gray-900">

        Skip to content
      </a>

      {/* Desktop: pinned sidebar. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] lg:block">
        <Sidebar
          audience={audience}
          variant={variant}
          homeHref={homeHref}
          navItems={navItems}
          onSignOut={signOut} />

      </aside>

      {/* Phones and tablets: a top bar that opens the same sidebar as a drawer. */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0A100D] px-4 py-2.5 text-white lg:hidden">
        <Link to={homeHref} className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <BrandLogo className="h-7" />
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="workspace-drawer"
          className="relative inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 text-[13.5px] font-medium hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">

          <MenuIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          Menu
          {pendingTotal > 0 &&
          <span className="auth-count rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none">
              {pendingTotal}
              <span className="sr-only"> waiting</span>
            </span>
          }
        </button>
      </header>

      <AnimatePresence>
        {drawerOpen &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true" />

            <motion.div
            id="workspace-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace menu"
            className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] shadow-2xl"
            initial={reduced ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}>

              <Sidebar
              audience={audience}
              variant={variant}
              homeHref={homeHref}
              navItems={navItems}
              onSignOut={signOut}
              onNavigate={() => setDrawerOpen(false)}
              headerAction={
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">

                    <XIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
              } />

            </motion.div>
          </div>
        }
      </AnimatePresence>

      <div className="lg:pl-[272px]">
        {/* Compact page header: title, who you are and the page's actions on one line, pinned
            while the content scrolls under it. */}
        <header className="z-30 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl lg:sticky lg:top-0">
          <div className="mx-auto max-w-5xl px-4 sm:px-8">
            <div className="flex min-h-[64px] items-center gap-x-4 gap-y-2 py-2.5">
              <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-gray-700">{section ?? title}</p>
              <AccountPanel identity={identity} variant={variant} profileHref={profileHref} onSignOut={signOut} />
            </div>

            {tabs &&
            <nav aria-label="Page sections" className="-mb-px overflow-x-auto">
                <ul className="flex min-w-max gap-1">
                  {tabs.map((tab) =>
                <li key={tab.to}>
                      <NavLink
                    to={tab.to}
                    end={tab.end}
                    className={({ isActive }) =>
                    `inline-flex min-h-[42px] items-center border-b-2 px-3 text-[13.5px] font-semibold transition-colors duration-150 ${
                    isActive ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`
                    }>

                        {tab.label}
                      </NavLink>
                    </li>
                )}
                </ul>
              </nav>
            }
          </div>
        </header>

        <PageTransition>
        <main id="workspace-main" aria-labelledby="workspace-title">
          <div className="mx-auto max-w-5xl px-4 pb-16 pt-7 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-3xl">
                <h1 id="workspace-title" className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
                  {title}
                </h1>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-gray-600">{intro}</p>
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
            {banner}
            <div className="mt-6">{children}</div>
          </div>
        </main>
        </PageTransition>
      </div>
    </div>);

}
