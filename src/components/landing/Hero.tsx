import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CorridorMap } from './CorridorMap';
import { EASE } from '../motion/Reveal';
import { opportunities } from '../../data/opportunities';
import { headlineMetric } from '../../data/observatory';
import { competentAuthorities } from '../../data/regulations';
import { useRegulatoryRegister } from '../../lib/regulatoryRegister';

export type HeroVariant = 'stacked' | 'split';

/** The rotating last word of the headline: "…matched to the world — with ___." */
const headlineWords = ['proof', 'evidence', 'consent', 'confidence', 'integrity'];

function RotatingWord({ reduced }: {reduced: boolean;}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % headlineWords.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return (
    // Every word sits in the same grid cell, the others invisible, so the cell is as wide as the
    // longest word and the headline never reflows as the word changes.
    <span className="relative inline-grid justify-items-start text-left align-baseline" aria-hidden="true">
      {headlineWords.map((word) =>
      <span key={word} className="invisible col-start-1 row-start-1 whitespace-nowrap">
          {word}.
        </span>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={headlineWords[index]}
          className="col-start-1 row-start-1 whitespace-nowrap text-gate-tint"
          initial={reduced ? false : { opacity: 0, y: '0.35em', filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduced ? undefined : { opacity: 0, y: '-0.35em', filter: 'blur(6px)' }}
          transition={{ duration: 0.35, ease: EASE }}>

          {headlineWords[index]}
          <span className="text-white">.</span>
        </motion.span>
      </AnimatePresence>
    </span>);

}

/** Live figures for the strip under the hero, read from the same records the console uses. */
function useGatewayFigures() {
  const { requirements } = useRegulatoryRegister();
  return [
  { label: 'Published requirements', value: requirements.filter((item) => item.status === 'current').length.toString() },
  { label: 'Live opportunities', value: opportunities.length.toString() },
  { label: 'Verified export value', value: `$${headlineMetric.value}M` },
  { label: 'Validating institutions', value: competentAuthorities.length.toString() }];

}

/** The `variant` prop is kept for the app's existing API; both render the same layout. */
export function Hero(_props: {variant?: HeroVariant;}) {
  const reduced = useReducedMotion();
  const figures = useGatewayFigures();

  const fade = (delay: number) =>
  reduced ?
  {} :
  {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.32, ease: EASE, delay }
  };

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#0A100D] pb-16 pt-44 sm:pb-20 sm:pt-44 lg:pb-12">

      {/* Map nudged down so its Nigeria hub lands between the headline and the figures. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[-12%] top-[12%] lg:bottom-[-22%] lg:top-[22%]" aria-hidden="true">
        <CorridorMap />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[#0A100D]/65" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-shell flex-1 flex-col justify-between gap-12 px-4">
        <div className="text-center">
          <motion.p
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-[0.16em] text-white/80">

            <span className="h-1.5 w-1.5 rounded-full bg-gate-tint" aria-hidden="true" />
            National Talent Export Programme
          </motion.p>

          <motion.h1
            {...fade(0.05)}
            className="mx-auto mt-5 max-w-4xl text-balance font-display text-[38px] font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:text-[54px] lg:text-[62px]">

            {/* Screen readers get one stable sentence; the rotation is visual only. */}
            <span className="sr-only">Nigerian expertise, matched to the world — with proof.</span>
            <span aria-hidden="true">Nigerian expertise, matched to the world — with </span>
            <RotatingWord reduced={Boolean(reduced)} />
          </motion.h1>

          <motion.p
            {...fade(0.1)}
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/75 sm:text-[16.5px]">

            One national platform where international demand is verified, market requirements are published with their
            source, Nigerian capability is evidenced rather than claimed, and every introduction is made with recorded
            consent.
          </motion.p>

          <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/buyer"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gate px-5 text-[14.5px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep">

              I am buying services
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/workspace"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-white/25 bg-white/[0.04] px-5 text-[14.5px] font-semibold text-white transition-colors duration-150 ease-out hover:border-white/50">

              I am exporting services
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          {...fade(0.22)}
          className="mx-auto w-full max-w-4xl rounded-2xl border border-white/12 bg-[#0A100D]/60 p-4 sm:p-5">

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            {figures.map((figure) =>
            <div key={figure.label} className="sm:border-l sm:border-white/10 sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
                <dt className="text-[12px] text-white/60">{figure.label}</dt>
                <dd className="mt-1 font-display text-[26px] font-semibold tabular-nums leading-none text-white sm:text-[30px]">
                  {figure.value}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-3 text-[12.5px]">
            <span className="inline-flex items-center gap-2 text-white/75">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-gate-tint opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gate-tint" />
              </span>
              Live on the Gateway · <span className="font-medium text-white">Operating</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>);

}
