import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PageTransition } from '../common/PageTransition';
import { BrandLogo } from '../common/BrandLogo';
import { Starfield } from '../workspace/Starfield';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChevronDownIcon,
  CrownIcon,
  DownloadIcon,
  EyeIcon,
  GlobeIcon,
  HandshakeIcon,
  HistoryIcon,
  LayersIcon,
  LayoutGridIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';
import { useOfficerProfile } from '../../lib/officerProfile';
import { useGatewayExchange } from '../../lib/gatewayExchange';
import { outcomeReports } from '../../data/outcomes';
import { initialsOf } from '../../lib/initials';

interface SidebarItem {
  icon: IconComponent;
  label: string;
  href: string;
  /** Sidebar group heading this item sits under. */
  group: string;
  end?: boolean;
  count?: number;
}

/** Sub-sections of one console section, shown as tabs under the section name. */
export interface ConsoleTab {
  to: string;
  label: string;
  end?: boolean;
  /** Items waiting in that tab, shown beside its label. */
  count?: number;
}

interface ConsoleLayoutProps {
  breadcrumb: string;
  onExport?: () => void;
  tabs?: ConsoleTab[];
  children: React.ReactNode;
}

/** What an officer is called on screen, by the role they are acting in. */
function roleLabel(profile: ReturnType<typeof useOfficerProfile>['profile']): string {
  if (profile.role === 'authority-focal') return `Competent authority focal · ${profile.authority}`;
  if (profile.role === 'content-drafter') return 'Regulatory content drafter';
  if (profile.role === 'adspa-auditor') return 'ADSPA auditor · read-only';
  return profile.title;
}

function ConsoleSidebar({
  items,
  onNavigate,
  headerAction




}: {items: SidebarItem[];onNavigate?: () => void;headerAction?: React.ReactNode;}) {
  return (
    <div className="auth-backdrop auth-galaxy relative isolate flex h-full flex-col overflow-hidden text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <div className="auth-aurora absolute inset-0" />
        <Starfield accent="#4fb68f" />
      </div>

      <div className="flex items-center justify-between gap-2 px-5 pt-5">
        <Link
          to="/console"
          onClick={onNavigate}
          className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">

          <BrandLogo className="h-8" />
        </Link>
        {headerAction}
      </div>

      <p className="auth-eyebrow mx-5 mt-5 inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
        <span className="auth-live-dot" aria-hidden="true" />
        Officer console
      </p>

      <nav aria-label="Console sections" className="mt-6 flex-1 overflow-y-auto px-3 pb-2">
        <ul className="space-y-1">
          {items.map(({ icon: Icon, label, href, group, end, count }, index) =>
          <li key={href}>
              {group !== items[index - 1]?.group &&
            <p className={`px-3 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/40 ${index > 0 ? 'pt-5' : ''}`}>
                  {group}
                </p>
            }
              <NavLink
              to={href}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
              `group relative flex min-h-[44px] items-center gap-3 rounded-2xl px-3 text-[14px] font-medium transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white ${
              isActive ? 'text-[#0D1A15]' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`
              }>

                {({ isActive }) =>
              <>
                    {isActive &&
                <motion.span
                  layoutId="console-nav"
                  className="absolute inset-0 rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }} />

                }
                    <span
                  className={`relative flex h-7 w-7 items-center justify-center rounded-lg ${
                  isActive ? 'auth-avatar' : 'bg-white/[0.06] text-white/75 group-hover:text-white'}`
                  }>

                      <Icon className="h-4 w-4" aria-hidden="true" />
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

/** The officer chip in the header, and the panel it opens. */
function OfficerPanel() {
  const { profile } = useOfficerProfile();
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

  const facts: { label: string; value: React.ReactNode }[] = [
  { label: 'Officer', value: profile.name },
  { label: 'Title', value: profile.title },
  { label: 'Acting as', value: roleLabel(profile) },
  { label: 'Secretariat', value: 'NATEP / NCMSE' }];


  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="officer-panel"
        className="profile-chip flex min-h-[44px] items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5">

        <span className="profile-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold" aria-hidden="true">
          {initialsOf(profile.name)}
        </span>
        <span className="hidden max-w-[190px] text-left leading-tight sm:block">
          <span className="block truncate text-[13.5px] font-semibold text-gray-900">{profile.name}</span>
          <span className="block truncate text-[11.5px] text-gray-600">{roleLabel(profile)}</span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        <span className="sr-only">Your account</span>
      </button>

      {createPortal(
      <AnimatePresence>
          {open &&
        <div className="auth-theme--exporter fixed inset-0 z-[60]">
              <motion.div
            className="absolute inset-0 bg-[#0A100D]/50 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true" />

              <motion.aside
            id="officer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Your account"
            initial={reduced ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)]">

                <div className="profile-panel-head px-6 pb-6 pt-5">
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
                      {initialsOf(profile.name)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[20px] font-semibold tracking-[-0.01em] text-gray-900">
                        {profile.name}
                      </span>
                      <span className="block truncate text-[13px] text-gray-600">{roleLabel(profile)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">Signed in as</h2>
                  <dl className="mt-3 divide-y divide-gray-100">
                    {facts.map((fact) =>
                <div key={fact.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5">
                        <dt className="text-[13px] text-gray-600">{fact.label}</dt>
                        <dd className="text-right text-[13.5px] font-medium text-gray-900">{fact.value}</dd>
                      </div>
                )}
                  </dl>
                  <p className="mt-4 text-[12.5px] leading-relaxed text-gray-600">
                    Every decision you take is recorded against this name in the audit log.
                  </p>
                </div>

                <div className="space-y-2 border-t border-gray-200 px-6 py-5">
                  <Link
                to="/console/settings"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-gray-200 px-4 text-[14px] font-semibold text-gray-900 hover:border-gray-400">

                    <SettingsIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    Profile and role
                  </Link>
                  <button
                type="button"
                disabled
                title="Sign out isn't wired up in this prototype"
                className="flex min-h-[48px] w-full items-center gap-3 rounded-2xl bg-gray-900 px-4 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">

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

/** Shared frame for the officer console: a pinned sidebar of grouped sections, a compact header
 * carrying the section name and the officer's account, and the page on a light canvas. */
export function ConsoleLayout({ breadcrumb, onExport, tabs, children }: ConsoleLayoutProps) {
  const { profile } = useOfficerProfile();
  const { pathname } = useLocation();
  const exchange = useGatewayExchange();
  const reduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const pendingSignals = exchange.requests.filter((request) => request.decision === 'pending').length;
  const provisionalOutcomes = outcomeReports.filter((report) => report.verification === 'provisional').length;

  const items: SidebarItem[] = [
  { icon: LayoutGridIcon, label: 'Dashboard', href: '/console', end: true, group: 'Case management' },
  { icon: BriefcaseIcon, label: 'Opportunities', href: '/console/opportunities', count: pendingSignals, group: 'Case management' },
  { icon: HandshakeIcon, label: 'Engagements', href: '/console/engagements', count: provisionalOutcomes, group: 'Case management' },
  { icon: UsersIcon, label: 'Registry', href: '/console/registry', group: 'Registries' },
  { icon: CrownIcon, label: 'Trust & badging', href: '/console/trust-badging', group: 'Registries' },
  { icon: ShieldCheckIcon, label: 'Compliance', href: '/console/compliance', group: 'Policy and reference' },
  { icon: LayersIcon, label: 'Taxonomies', href: '/console/taxonomies', group: 'Policy and reference' },
  { icon: GlobeIcon, label: 'Market intelligence', href: '/console/market-intelligence', group: 'Policy and reference' },
  { icon: ActivityIcon, label: 'Observatory', href: '/console/observatory', group: 'Policy and reference' },
  { icon: HistoryIcon, label: 'Audit log', href: '/console/audit', group: 'Records' },
  { icon: SettingsIcon, label: 'Settings', href: '/console/settings', group: 'Account' }];


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

  const waiting = pendingSignals + provisionalOutcomes;

  return (
    <div className="auth-theme--exporter workspace-canvas min-h-screen w-full text-gray-900 [color-scheme:light]">
      <a
        href="#console-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-[13px] focus:text-gray-900">

        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] xl:block">
        <ConsoleSidebar items={items} />
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0A100D] px-4 py-2.5 text-white xl:hidden">
        <Link to="/console" className="rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <BrandLogo className="h-7" />
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="console-drawer"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-4 text-[13.5px] font-medium hover:border-white/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">

          <MenuIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          Sections
          {waiting > 0 &&
          <span className="auth-count rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none">
              {waiting}
              <span className="sr-only"> waiting</span>
            </span>
          }
        </button>
      </header>

      <AnimatePresence>
        {drawerOpen &&
        <div className="fixed inset-0 z-50 xl:hidden">
            <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true" />

            <motion.div
            id="console-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Console sections"
            className="absolute inset-y-0 left-0 w-[86%] max-w-[320px] shadow-2xl"
            initial={reduced ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 38 }}>

              <ConsoleSidebar
              items={items}
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

      <div className="xl:pl-[272px]">
        <header className="z-30 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl xl:sticky xl:top-0">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="flex min-h-[64px] flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-gray-700">{breadcrumb}</p>

            <div className="flex shrink-0 items-center gap-2">
              {profile.role === 'adspa-auditor' &&
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12.5px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
                  <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Read-only
                </span>
              }
              <span className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200 lg:inline-flex">
                <CalendarIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Last 30 days
              </span>
              <button
                type="button"
                onClick={onExport}
                disabled={!onExport}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-colors duration-150 ease-out hover:text-gray-900 hover:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:ring-gray-200">

                <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Export
              </button>
              <OfficerPanel />
            </div>
          </div>

          {tabs &&
          <nav aria-label="Section pages" className="-mb-px overflow-x-auto">
              <ul className="flex min-w-max gap-1">
                {tabs.map((tab) =>
              <li key={tab.to}>
                    <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                  `inline-flex min-h-[42px] items-center gap-2 border-b-2 px-3 text-[13.5px] font-semibold transition-colors duration-150 ${
                  isActive ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'}`
                  }>

                      {tab.label}
                      {Boolean(tab.count) &&
                  <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                          {tab.count}
                          <span className="sr-only"> waiting</span>
                        </span>
                  }
                    </NavLink>
                  </li>
              )}
              </ul>
            </nav>
          }
          </div>
        </header>

        <PageTransition>
          <main id="console-main" className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-8">{children}</main>
        </PageTransition>
      </div>
    </div>);

}
