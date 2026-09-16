import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ShieldCheckIcon } from 'lucide-react';
import { PipelineRail } from './PipelineRail';
import { CorridorMap } from './CorridorMap';
import { HeroMessage } from './HeroMessage';
import { EASE } from '../motion/Reveal';

export type HeroVariant = 'stacked' | 'split';

function Actions({ align = 'center' }: {align?: 'center' | 'start';}) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
      <a
        href="#portals"
        className="inline-flex items-center gap-2 rounded-xl bg-gate px-5 py-3 text-[14px] font-semibold text-black transition-colors duration-150 ease-out hover:bg-gate-deep">

        See how the Gateway works
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </a>
      <a
        href="#governance"
        className="inline-flex items-center gap-2 rounded-xl border border-white/14 px-5 py-3 text-[14px] font-semibold text-white transition-colors duration-150 ease-out hover:border-white/30">

        Institutional onboarding
      </a>
    </div>);

}

export function Hero({ variant = 'stacked' }: {variant?: HeroVariant;}) {
  const reduced = useReducedMotion();

  const intro =
  <motion.p
    initial={reduced ? false : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28, ease: EASE }}
    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[11.5px] text-white/70">

      <ShieldCheckIcon className="h-3.5 w-3.5 text-gate" aria-hidden="true" />
      FMITI · NATEP / NCMSE · NDPA 2023 by design
    </motion.p>;


  if (variant === 'split') {
    return (
      <section id="top" className="relative overflow-hidden pt-32 sm:pt-36">
        <CorridorMap />
        <div className="pointer-events-none absolute inset-0 bg-black/55" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-shell items-center gap-10 px-4 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:pb-24">
          <div>
            {intro}
            <div className="mt-6">
              <HeroMessage
                align="start"
                headlineClass="min-h-[3.25em] font-display text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:min-h-[2.3em] sm:text-[54px] lg:text-[60px]"
                subClass="max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base" />
              
            </div>
            <div className="mt-8">
              <Actions align="start" />
            </div>
          </div>
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE, delay: reduced ? 0 : 0.2 }}>
            
            <PipelineRail />
          </motion.div>
        </div>
      </section>);

  }

  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-40">
      <CorridorMap />
      <div className="pointer-events-none absolute inset-0 bg-black/60" aria-hidden="true" />
      <div className="relative mx-auto max-w-shell px-4 pb-16 lg:pb-24">
        <div className="text-center">{intro}</div>
        <div className="mt-7">
          <HeroMessage
            align="center"
            headlineClass="mx-auto max-w-4xl min-h-[3.25em] font-display text-[42px] font-semibold leading-[1.03] tracking-[-0.03em] text-white sm:min-h-[2.2em] sm:text-[64px] lg:text-[78px]"
            subClass="max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-base" />
          
        </div>
        <div className="mt-8">
          <Actions />
        </div>
        <motion.div
          className="mt-14 text-left"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE, delay: reduced ? 0 : 0.34 }}>
          
          <PipelineRail />
        </motion.div>
      </div>
    </section>);

}