import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ActivityIcon,
  ChevronRightIcon,
  FingerprintIcon,
  GaugeIcon,
  InboxIcon,
  KeyRoundIcon,
  LayersIcon,
  ScaleIcon } from
'lucide-react';
import type { IconComponent } from '../../types/icons';
import { capabilities, type DemoKey } from '../../data/portals';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { EASE, Reveal } from '../motion/Reveal';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { MatchingDemo } from '../demos/MatchingDemo';
import { IntakeDemo } from '../demos/IntakeDemo';
import { ConsentDemo } from '../demos/ConsentDemo';
import { VaultDemo } from '../demos/VaultDemo';
import { ReadinessDemo } from '../demos/ReadinessDemo';
import { ObservatoryDemo } from '../demos/ObservatoryDemo';

const cardIcons: Record<DemoKey, IconComponent> = {
  matching: ScaleIcon,
  intake: InboxIcon,
  consent: KeyRoundIcon,
  readiness: GaugeIcon,
  vault: FingerprintIcon,
  observatory: ActivityIcon
};

function Demo({ demo, live }: {demo: DemoKey;live: boolean;}) {
  switch (demo) {
    case 'matching':
      return <MatchingDemo live={live} />;
    case 'intake':
      return <IntakeDemo live={live} />;
    case 'consent':
      return <ConsentDemo />;
    case 'vault':
      return <VaultDemo live={live} />;
    case 'readiness':
      return <ReadinessDemo />;
    case 'observatory':
      return <ObservatoryDemo />;
    default:
      return null;
  }
}

export function CapabilityGrid({ liveDemos = true }: {liveDemos?: boolean;}) {
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [activeId, setActiveId] = useState(capabilities[0].id);
  const active = capabilities.find((item) => item.id === activeId) ?? capabilities[0];
  const ActiveIcon = cardIcons[active.demo];

  return (
    <section id="portals" className="mx-auto max-w-shell px-4 pb-24 sm:pb-32">
      <div className="max-w-2xl">
        <SectionEyebrow icon={LayersIcon}>Built for four groups of people</SectionEyebrow>
        <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
          What the Gateway actually does
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-chalk-muted">
          It is not a job board and it does not hold your money. It connects real buyers to verified Nigerian firms —
          and keeps everyone honest about what was promised and what was delivered.
        </p>
      </div>

      <div className="mt-12 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
        <Reveal>
          <ul className="space-y-1.5">
            {capabilities.map((capability) => {
              const Icon = cardIcons[capability.demo];
              const isActive = capability.id === activeId;
              return (
                <li key={capability.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(capability.id)}
                    aria-expanded={isActive}
                    className={`group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors duration-150 ease-out ${
                    isActive ? 'bg-gate/[0.1]' : 'bg-ink-800/40 hover:bg-ink-800/80'}`
                    }>
                    
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-colors duration-150 ease-out ${
                      isActive ? 'bg-gate/18 text-gate-soft' : 'bg-hairline/[0.05] text-chalk-muted'}`
                      }>
                      
                      <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-chalk-dim">
                        {capability.eyebrow}
                      </span>
                      <span
                        className={`mt-0.5 block text-[15px] font-semibold leading-snug ${
                        isActive ? 'text-chalk' : 'text-chalk-muted'}`
                        }>
                        
                        {capability.title}
                      </span>
                    </span>

                    <ChevronRightIcon
                      className={`h-4 w-4 shrink-0 transition-colors duration-150 ease-out ${
                      isActive ? 'text-gate-soft' : 'text-chalk-dim'}`
                      }
                      aria-hidden="true" />
                    
                  </button>

                  {!isDesktop && isActive &&
                  <motion.div
                    initial={reduced ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="overflow-hidden">
                    
                      <div className="mt-2 rounded-2xl border border-hairline/8 bg-ink-800/60 p-4">
                        <p className="text-[13.5px] leading-relaxed text-chalk-muted">{capability.blurb}</p>
                        <div className="mt-4">
                          <Demo demo={capability.demo} live={liveDemos} />
                        </div>
                      </div>
                    </motion.div>
                  }
                </li>);

            })}
          </ul>
        </Reveal>

        {isDesktop &&
        <Reveal delay={0.05}>
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-hairline/10 bg-ink-800/70 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: EASE }}>
                
                  <div className="flex items-start gap-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gate/15 text-gate-soft">
                      <ActiveIcon className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-chalk-dim">
                        {active.eyebrow}
                      </p>
                      <h3 className="mt-1 font-display text-[22px] font-semibold leading-snug tracking-[-0.015em] text-chalk">
                        {active.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-chalk-muted">{active.blurb}</p>

                  <div className="mt-6 border-t border-hairline/8 pt-6">
                    <Demo demo={active.demo} live={liveDemos} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        }
      </div>
    </section>);

}