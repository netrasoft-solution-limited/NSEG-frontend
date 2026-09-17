import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckIcon, ShieldCheckIcon, PackageCheckIcon, UserIcon, ArrowUpRightIcon } from "lucide-react";
import type { IconComponent } from "../../types/icons";
import { trustTiers } from "../../data/trustTiers";
import { SectionEyebrow } from "../site/SectionEyebrow";
import { EASE, Reveal } from "../motion/Reveal";
const tierIcons: IconComponent[] = [UserIcon, ShieldCheckIcon, PackageCheckIcon];
const accentStyles = {
  dim: {
    dot: 'bg-hairline/30',
    text: 'text-chalk-muted',
    ring: 'border-hairline/14',
    icon: 'text-chalk-muted'
  },
  gate: {
    dot: 'bg-gate',
    text: 'text-gate-soft',
    ring: 'border-gate/45',
    icon: 'text-gate-soft'
  },
  gold: {
    dot: 'bg-gold',
    text: 'text-gold',
    ring: 'border-gold/45',
    icon: 'text-gold'
  }
} as const;
export function TrustLadder() {
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState(1);
  const tier = trustTiers[selected];
  const accent = accentStyles[tier.accent];
  const ActiveIcon = tierIcons[selected];
  return <section id="trust" className="border-y border-hairline/6 bg-ink-800/30">
      <div className="mx-auto grid max-w-shell gap-10 px-4 py-24 sm:py-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Reveal>
          <SectionEyebrow icon={ShieldCheckIcon}>Progressive trust</SectionEyebrow>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[40px]">
            Access is earned, and always legible
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-muted">
            Registration is unblocked. Capability unlocks as verification deepens, and every exporter sees exactly what
            the next step buys them — no opaque quality ratings, no blanket government endorsement.
          </p>
          <ul className="mt-8 space-y-1.5" role="tablist" aria-label="Trust tiers">
            {trustTiers.map((item, index) => {
            const isActive = index === selected;
            const itemAccent = accentStyles[item.accent];
            const Icon = tierIcons[index];
            return <li key={item.id}>
                  <button type="button" role="tab" aria-selected={isActive} onClick={() => setSelected(index)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150 ease-out ${isActive ? `${itemAccent.ring} bg-hairline/[0.05]` : 'border-hairline/8 hover:border-hairline/16'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-hairline/10 bg-hairline/[0.03] ${itemAccent.icon}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-chalk">{item.badge}</span>
                      <span className="block text-[11.5px] text-chalk-dim">{item.verifies}</span>
                    </span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? itemAccent.dot : 'bg-hairline/12'}`} />
                  </button>
                </li>;
          })}
          </ul>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="h-full rounded-2xl border border-hairline/8 bg-ink-800/80 p-6">
            <AnimatePresence mode="wait">
              <motion.div key={tier.id} initial={reduced ? false : {
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={reduced ? undefined : {
              opacity: 0,
              y: -8
            }} transition={{
              duration: 0.22,
              ease: EASE
            }}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border border-hairline/10 bg-hairline/[0.04] ${accent.icon}`}>
                    <ActiveIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className={`text-[11px] uppercase tracking-[0.16em] ${accent.text}`}>What this tier unlocks</p>
                    <h3 className="mt-0.5 font-display text-[22px] font-semibold tracking-[-0.015em] text-chalk">
                      {tier.badge}
                    </h3>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {tier.unlocked.map((capability) => <li key={capability} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-hairline/8">
                        <CheckIcon className="h-3 w-3 text-chalk" aria-hidden="true" />
                      </span>
                      <span className="text-[14px] leading-snug text-chalk-muted">{capability}</span>
                    </li>)}
                </ul>

                <div className="mt-7 rounded-xl border border-hairline/8 bg-hairline/[0.03] p-4">
                  <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-chalk-dim">
                    <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Next unlock prompt
                  </p>
                  <p className="mt-2 text-[14px] leading-snug text-chalk">{tier.nextStep}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>;
}