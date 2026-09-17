import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { Link, NavLink } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  FileCheck2Icon,
  HandshakeIcon,
  KeyRoundIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrendingUpIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';
import { Starfield } from './Starfield';

type Audience = 'exporter' | 'buyer';

interface ProofEvent {
  id: string;
  icon: IconComponent;
  title: string;
  detail: string;
  when: string;
}

const story: Record<Audience, {eyebrow: string;title: React.ReactNode;events: ProofEvent[];}> = {
  exporter: {
    eyebrow: 'Exporter workspace',
    title:
    <>
        Your work, <span className="auth-gradient-text">verified</span> for the world.
      </>,

    events: [
    { id: 'cac', icon: BadgeCheckIcon, title: 'CAC registration verified', detail: 'Corporate Affairs Commission · RC 1482093', when: 'now' },
    { id: 'intro', icon: HandshakeIcon, title: 'Introduction requested', detail: 'UK fintech · QA engagement · awaiting your consent', when: '2m' },
    { id: 'consent', icon: KeyRoundIcon, title: 'Consent granted', detail: '3 profile fields shared · expires in 30 days', when: '1h' },
    { id: 'tier', icon: TrendingUpIcon, title: 'Tier raised to Delivery Verified', detail: 'Cross-border delivery confirmed by an officer', when: '3d' }]

  },
  buyer: {
    eyebrow: 'Buyer workspace',
    title:
    <>
        Source Nigerian talent with <span className="auth-gradient-text">certainty</span>.
      </>,

    events: [
    { id: 'qualified', icon: ShieldCheckIcon, title: 'Request qualified', detail: 'NATEP desk officer · Cloud security audit', when: 'now' },
    { id: 'shortlist', icon: ListChecksIcon, title: 'Shortlist ready', detail: '5 verified exporters · reasons attached', when: '4m' },
    { id: 'reason', icon: SparklesIcon, title: 'Why this match', detail: 'ISO 27001 evidence + cross-border delivery', when: '4m' },
    { id: 'accepted', icon: FileCheck2Icon, title: 'Introduction accepted', detail: 'Lagos security firm shared their profile', when: '1h' }]

  }
};

/** A slowly cycling stack of example Gateway events: shows what the product does instead of listing it. */
function ProofStack({ events }: {events: ProofEvent[];}) {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setOffset((value) => (value + 1) % events.length), 3200);
    return () => window.clearInterval(timer);
  }, [reduced, events.length]);

  const visible = [0, 1, 2].map((k) => events[(offset + k) % events.length]);

  return (
    <div aria-hidden="true" className="mt-10 hidden max-w-[440px] lg:block">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/50">
        <span className="auth-live-dot" />
        Example activity
      </p>
      <ul className="relative space-y-2.5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map(({ id, icon: Icon, title, when }, index) =>
          <motion.li
            key={id}
            layout
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1 - index * 0.28, y: 0, scale: 1 - index * 0.025 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className={`auth-glass flex items-center gap-3.5 rounded-2xl p-3.5 ${index === 0 ? 'auth-glass--lead' : ''}`}>

              <span className="auth-event-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-white">{title}</span>
                              </span>
              <span className="shrink-0 font-mono text-[11px] text-white/45">{when}</span>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
    </div>);

}

/** Concentric "gateway" rings with orbiting nodes — decorative, sits behind the story. */
function GatewayRings() {
  return (
    <svg viewBox="0 0 800 800" className="auth-rings pointer-events-none absolute" aria-hidden="true">
      <defs>
        <radialGradient id="auth-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--auth-glow)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--auth-glow)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="400" cy="400" r="210" fill="url(#auth-core)" />
      {[130, 210, 290, 370].map((r, i) =>
      <circle
        key={r}
        cx="400"
        cy="400"
        r={r}
        fill="none"
        stroke="white"
        strokeOpacity={0.11 - i * 0.018}
        strokeDasharray={i % 2 ? '2 10' : undefined} />

      )}
      <g className="auth-orbit">
        <circle cx="400" cy="190" r="5" fill="var(--auth-glow)" />
        <circle cx="610" cy="400" r="3" fill="white" fillOpacity="0.7" />
      </g>
      <g className="auth-orbit auth-orbit--reverse">
        <circle cx="400" cy="770" r="4" fill="var(--auth-glow)" />
        <circle cx="30" cy="400" r="3" fill="white" fillOpacity="0.5" />
        <circle cx="690" cy="400" r="6" fill="var(--auth-glow)" fillOpacity="0.6" />
      </g>
    </svg>);

}

const switchTabs = [
{ audience: 'exporter' as Audience, label: 'Exporter', to: '/workspace/sign-in' },
{ audience: 'buyer' as Audience, label: 'Buyer', to: '/buyer/sign-in' }];


interface AuthLayoutProps {
  audience: Audience;
  switchLink: {label: string;to: string;};
  /** Registration steps. Their presence marks the page as onboarding; the stepper itself sits
   * above the form (see StepProgress). */
  steps?: string[];
  currentStep?: number;
  children: React.ReactNode;
}

/** Sign-in and onboarding frame: an immersive story panel (pinned on desktop, a header band on
 * phones) beside a calm, spacious form surface. Accent colours come from CSS variables set by
 * `.auth-theme--*`, so the form controls, buttons and the showcase share one palette per audience. */
export function AuthLayout({ audience, switchLink, steps, children }: AuthLayoutProps) {
  const content = story[audience];
  const isSignIn = !steps;
  const reduced = useReducedMotion();

  return (
    <div
      className={`auth-theme--${audience} min-h-screen w-full bg-white text-gray-900 [color-scheme:light] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]`}>

      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-[13px] focus:text-gray-900">

        Skip to content
      </a>

      <aside
        className={`auth-backdrop auth-galaxy relative isolate overflow-hidden text-white lg:sticky lg:top-0 lg:h-screen ${
        audience === 'buyer' ? 'auth-backdrop--buyer' : ''}`
        }>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="auth-aurora absolute inset-0" />
          <div className="auth-nebula absolute inset-0" />
          <Starfield accent={audience === 'exporter' ? '#4fb68f' : '#e0b25c'} />
          <GatewayRings />
          <div className="auth-grain absolute inset-0" />
        </div>

        <div className="relative flex h-full flex-col px-5 pb-12 pt-5 sm:px-8 lg:px-12 lg:py-9 xl:px-16">
          <Link
            to="/"
            className="self-start rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">

            <BrandLogo className="h-8 sm:h-9" />
          </Link>

          <div className="mt-9 lg:my-auto lg:pt-10">
            <p className="auth-eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
              <span className="auth-live-dot" aria-hidden="true" />
              {content.eyebrow}
            </p>
            <p className="mt-5 max-w-[560px] text-balance font-sora text-[34px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[44px] lg:text-[54px] xl:text-[62px]">
              {content.title}
            </p>

            <ProofStack events={content.events} />
          </div>

        </div>
      </aside>

      <div className="relative z-10 -mt-7 flex min-h-[70vh] flex-col rounded-t-[32px] bg-white lg:mt-0 lg:min-h-screen lg:rounded-none">

        <div className="relative flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 lg:px-12 lg:pt-8">
          <Link
            to="/"
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-full text-[13px] font-medium text-gray-600 hover:text-gray-900">

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">Gateway home</span>
          </Link>

          {isSignIn ?
          <nav aria-label="Choose your workspace" className="relative flex rounded-full bg-black/[0.05] p-1 ring-1 ring-black/5">
              {switchTabs.map((tab) =>
            <NavLink
              key={tab.audience}
              to={tab.to}
              className="relative inline-flex min-h-[40px] items-center rounded-full px-4 text-[13px] font-semibold text-gray-600 transition-colors duration-200 hover:text-gray-900 aria-[current=page]:text-gray-900">

                  {tab.audience === audience &&
              <motion.span
                layoutId="auth-switch-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }} />

              }
                  <span className="relative">{tab.label}</span>
                </NavLink>
            )}
            </nav> :

          <Link
            to={switchLink.to}
            className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-[13px] font-semibold text-gray-800 shadow-sm ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-md">

              {switchLink.label}
            </Link>
          }
        </div>

        <main
          id="auth-main"
          className="auth-sheet relative mx-auto flex w-full max-w-[468px] flex-1 flex-col justify-center px-5 pb-10 pt-8 sm:px-0 lg:py-12">

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>

            {children}
          </motion.div>
        </main>

      </div>
    </div>);

}
