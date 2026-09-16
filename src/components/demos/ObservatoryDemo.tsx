import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { supplyModes, topCategories } from '../../data/observatory';
import { EASE } from '../motion/Reveal';

export function ObservatoryDemo() {
  const reduced = useReducedMotion();

  return (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">By WTO/GATS supply mode</p>
        <ul className="mt-3 space-y-2.5">
          {supplyModes.map((mode, index) =>
          <li key={mode.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] text-chalk-muted">{mode.label}</span>
                <span className="font-mono text-[11px] text-chalk">${mode.value.toFixed(2)}M</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-hairline/8">
                <motion.div
                className={`h-full rounded-full ${index === 0 ? 'bg-gate' : 'bg-gate/40'}`}
                initial={reduced ? false : { width: 0 }}
                whileInView={{ width: `${mode.share}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: EASE, delay: reduced ? 0 : index * 0.05 }} />
              
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="rounded-xl border border-hairline/6 bg-ink-800/80 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Top service categories</p>
        <ul className="mt-3 divide-y divide-hairline/6">
          {topCategories.map((category) =>
          <li key={category.code} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="min-w-0">
                <span className="block truncate text-[12px] text-chalk">{category.label}</span>
                <span className="block font-mono text-[10px] text-chalk-dim">UN CPC {category.code}</span>
              </span>
              <span className="shrink-0 font-mono text-[11px] text-chalk-muted">${category.value}</span>
            </li>
          )}
        </ul>
        <p className="mt-3 border-t border-hairline/6 pt-3 text-[11px] leading-relaxed text-chalk-dim">
          Categories with fewer than three active entities are suppressed to protect commercial confidentiality.
        </p>
      </div>
    </div>);

}