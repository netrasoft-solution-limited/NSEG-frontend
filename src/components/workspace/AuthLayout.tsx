import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CheckIcon,
  CompassIcon,
  HourglassIcon,
  ListChecksIcon,
  LockIcon,
  ShieldCheckIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';

type Audience = 'exporter' | 'buyer';

const story: Record<Audience, {eyebrow: string;title: React.ReactNode;points: {icon: IconComponent;title: string;detail: string;}[];}> = {
  exporter: {
    eyebrow: 'Exporter workspace',
    title:
    <>
        Your route to <span className="text-gate">verified</span> export work.
      </>,

    points: [
    {
      icon: ShieldCheckIcon,
      title: 'Verification that means something',
      detail: 'Tiers state exactly what was checked — CAC, TIN, NIN — never a rating of your work.'
    },
    {
      icon: LockIcon,
      title: 'Private until you say so',
      detail: 'Buyers only see your profile after you accept an introduction.'
    },
    {
      icon: CompassIcon,
      title: 'Know which rules apply to you',
      detail: 'A pathway through export requirements for your service and your market.'
    }]

  },
  buyer: {
    eyebrow: 'Buyer workspace',
    title:
    <>
        Source Nigerian services with <span className="text-[#8cc8ff]">confidence</span>.
      </>,

    points: [
    {
      icon: BadgeCheckIcon,
      title: 'Officer-qualified requests',
      detail: 'A NATEP desk officer reviews every request before exporters see it.'
    },
    {
      icon: ListChecksIcon,
      title: 'Shortlists you can explain',
      detail: 'See exactly why each exporter matches — and what has been verified about them.'
    },
    {
      icon: HourglassIcon,
      title: 'Verify only when it matters',
      detail: 'Explore and draft freely. Company checks happen when you submit.'
    }]

  }
};

interface AuthLayoutProps {
  audience: Audience;
  switchLink: {label: string;to: string;};
  /** Registration steps — shown as a tracker in the story panel on large screens. */
  steps?: string[];
  currentStep?: number;
  children: React.ReactNode;
}

/** Sign-in and onboarding frame: a gradient story panel beside a bright form sheet. The form
 * itself stays dark-on-white for contrast; the atmosphere lives around it. */
export function AuthLayout({ audience, switchLink, steps, currentStep = 0, children }: AuthLayoutProps) {
  const content = story[audience];
  const accentText = audience === 'exporter' ? 'text-gate' : 'text-[#8cc8ff]';
  const accentRing = audience === 'exporter' ? 'bg-gate text-black' : 'bg-[#8cc8ff] text-black';

  return (
    <div
      className={`auth-backdrop relative min-h-screen w-full overflow-hidden text-white ${
      audience === 'buyer' ? 'auth-backdrop--buyer' : ''}`
      }>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={`auth-orb absolute -left-24 top-24 h-80 w-80 rounded-full blur-3xl ${
          audience === 'exporter' ? 'bg-gate/25' : 'bg-[#5aa9f8]/25'}`
          } />

        <div className="auth-orb auth-orb--slow absolute bottom-10 right-[-6rem] h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-[13px] focus:text-gray-900">

        Skip to content
      </a>

      <header className="relative">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">

            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gate" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-sm bg-black" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold">Service Export Gateway</span>
              <span className="block text-[12px] text-white/70">{content.eyebrow}</span>
            </span>
          </Link>
          <Link
            to={switchLink.to}
            className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-4 text-[13px] font-medium text-white/90 backdrop-blur transition-colors duration-150 ease-out hover:border-white/35 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">

            {switchLink.label}
          </Link>
        </div>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-14 lg:pt-10">
        <aside className="lg:pt-6">
          <p className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11.5px] uppercase tracking-[0.14em] ${accentText}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${audience === 'exporter' ? 'bg-gate' : 'bg-[#8cc8ff]'}`} aria-hidden="true" />
            {content.eyebrow}
          </p>
          <p className="mt-4 max-w-md text-balance font-display text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[40px] lg:text-[48px]">
            {content.title}
          </p>

          {steps ?
          <ol className="mt-8 hidden space-y-1 lg:block" aria-label="Registration steps">
              {steps.map((step, index) => {
              const done = index < currentStep;
              const active = index === currentStep;
              return (
                <li key={step} className="flex items-center gap-3" aria-current={active ? 'step' : undefined}>
                    <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors duration-200 ${
                    active ? accentRing : done ? 'bg-white/15 text-white' : 'border border-white/20 text-white/60'}`
                    }>

                      {done ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : index + 1}
                    </span>
                    <span className={`py-2 text-[14.5px] ${active ? 'font-semibold text-white' : done ? 'text-white/80' : 'text-white/60'}`}>
                      {step}
                      <span className="sr-only">{done ? ' (done)' : active ? ' (current)' : ''}</span>
                    </span>
                  </li>);

            })}
            </ol> :

          <ul className="mt-8 hidden max-w-md space-y-5 lg:block">
              {content.points.map(({ icon: Icon, title, detail }) =>
            <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] backdrop-blur">
                    <Icon className={`h-5 w-5 ${accentText}`} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold">{title}</span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-white/70">{detail}</span>
                  </span>
                </li>
            )}
            </ul>
          }

          <p className="mt-10 hidden text-[12px] text-white/55 lg:block">FMITI · NATEP / NCMSE · NDPA 2023 by design</p>
        </aside>

        <main
          id="auth-main"
          className="relative rounded-[28px] bg-white p-6 text-gray-900 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.75)] ring-1 ring-white/20 [color-scheme:light] sm:p-8">

          {children}
        </main>
      </div>

      <footer className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-white/75 hover:text-white">

          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to the Service Export Gateway
        </Link>
      </footer>
    </div>);

}
