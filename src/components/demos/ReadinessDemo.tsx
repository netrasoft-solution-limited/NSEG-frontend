import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../motion/Reveal';

const parameters = [
{ label: 'Export capacity', weight: '25%', score: 85 },
{ label: 'Financial stability', weight: '20%', score: 80 },
{ label: 'Quality systems', weight: '20%', score: 80 },
{ label: 'Cross-border delivery', weight: '20%', score: 85 },
{ label: 'Legal & IP protection', weight: '15%', score: 75 }];


const SCORE = 82;
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ReadinessDemo() {
  const reduced = useReducedMotion();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative h-[84px] w-[84px] shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-hairline/[0.09]" />
            <motion.circle
              cx="40"
              cy="40"
              r={RADIUS}
              fill="none"
              stroke="#16b364"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={reduced ? false : { strokeDashoffset: CIRCUMFERENCE }}
              whileInView={{ strokeDashoffset: CIRCUMFERENCE * (1 - SCORE / 100) }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: EASE }} />
            
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-semibold text-chalk">{SCORE}</span>
            <span className="text-[9px] uppercase tracking-[0.12em] text-chalk-dim">score</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-gate-soft">Level 3</p>
          <p className="font-display text-base font-semibold text-chalk">Export Ready</p>
          <p className="mt-0.5 text-[11px] text-chalk-dim">Max match multiplier · full incentive eligibility</p>
        </div>
      </div>

      <ul className="space-y-2">
        {parameters.map((parameter, index) =>
        <li key={parameter.label} className="flex items-center gap-2.5">
            <span className="w-[112px] shrink-0 truncate text-[11px] text-chalk-muted">{parameter.label}</span>
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-hairline/8">
              <motion.span
              className="block h-full rounded-full bg-gate/70"
              initial={reduced ? false : { width: 0 }}
              whileInView={{ width: `${parameter.score}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.28, ease: EASE, delay: reduced ? 0 : index * 0.04 }} />
            
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-chalk-dim">{parameter.weight}</span>
          </li>
        )}
      </ul>
    </div>);

}