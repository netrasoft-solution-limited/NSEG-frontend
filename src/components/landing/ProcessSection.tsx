import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  KeyRoundIcon,
  RouteIcon,
  ScaleIcon,
  UserCheckIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';
import { processStages, type ProcessIcon } from '../../data/landing';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { Reveal } from '../motion/Reveal';

const stageIcons: Record<ProcessIcon, IconComponent> = {
  demand: FileTextIcon,
  qualified: ClipboardCheckIcon,
  rules: ScaleIcon,
  matched: RouteIcon,
  consent: KeyRoundIcon,
  outcome: BadgeCheckIcon
};

/** "The process": six stages from a stated requirement to a verified outcome. Stages that need a
 * named human decision are marked in gold. A real sequence, so the stages are numbered. */
export function ProcessSection() {
  return (
    <section id="process" className="mx-auto max-w-shell scroll-mt-28 px-4 py-24 sm:py-28">
      <Reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <SectionEyebrow icon={RouteIcon}>The process</SectionEyebrow>
            <h2 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
              From a stated requirement to a verified outcome
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-chalk-muted">
            Six stages you can follow end to end inside this working prototype.{' '}
            <span className="inline-flex items-center gap-1.5 font-medium text-gold">
              <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
              Stages in gold
            </span>{' '}
            require a named human decision.
          </p>
        </div>
      </Reveal>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {processStages.map((stage, index) => {
          const Icon = stageIcons[stage.icon];
          return (
            <Reveal as="li" key={stage.id} delay={index * 0.04}>
              <div
                className={`relative h-full rounded-3xl border p-6 ${
                stage.humanDecision ? 'border-gold/35 bg-gold/[0.05]' : 'border-hairline/10 bg-ink-800/60'}`
                }>

                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                    stage.humanDecision ? 'border-gold/40 bg-gold/10 text-gold' : 'border-gate/25 bg-gate/10 text-gate-soft'}`
                    }>

                    <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[28px] font-semibold leading-none text-chalk-dim/60">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[20px] font-semibold tracking-[-0.01em] text-chalk">{stage.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-chalk-muted">{stage.detail}</p>
                <p
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${
                  stage.humanDecision ? 'bg-gold/15 text-gold' : 'bg-hairline/[0.06] text-chalk-muted'}`
                  }>

                  {stage.humanDecision && <UserCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                  {stage.owner}
                  {stage.humanDecision && <span className="sr-only"> — a named human decision</span>}
                </p>
              </div>
            </Reveal>);

        })}
      </ol>

      <Reveal delay={0.1}>
        <div className="mt-12 flex flex-col items-start gap-6 rounded-3xl border border-gate/25 bg-gradient-to-br from-gate/15 via-ink-800/60 to-ink-800/60 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-chalk sm:text-[30px]">
              Explore the working Gateway
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-chalk-muted">
              This is a functioning prototype. Place a requirement as a buyer, qualify and match it as an operations
              officer, grant consent as an exporter, accept the contract, and watch the Observatory update in real time.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/buyer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gate px-5 text-[14.5px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep">

              Start as a buyer
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>);

}
