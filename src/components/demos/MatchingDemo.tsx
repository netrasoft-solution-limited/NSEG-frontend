import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../motion/Reveal';

interface Candidate {
  id: string;
  name: string;
  natepId: string;
  score: number;
  factors: {label: string;weight: number;got: number;}[];
}

const candidates: Candidate[] = [
{
  id: 'a',
  name: 'Apex Software Global',
  natepId: 'NT-B26-94821',
  score: 91,
  factors: [
  { label: 'Team capacity', weight: 30, got: 28 },
  { label: 'Verified status', weight: 30, got: 30 },
  { label: 'Track record', weight: 20, got: 18 },
  { label: 'Skills match', weight: 20, got: 15 }]

},
{
  id: 'b',
  name: 'Lagos Delivery Collective',
  natepId: 'NT-B26-11029',
  score: 78,
  factors: [
  { label: 'Team capacity', weight: 30, got: 24 },
  { label: 'Verified status', weight: 30, got: 22 },
  { label: 'Track record', weight: 20, got: 16 },
  { label: 'Skills match', weight: 20, got: 16 }]

},
{
  id: 'c',
  name: 'Abuja Analytics Partners',
  natepId: 'NT-B26-55402',
  score: 64,
  factors: [
  { label: 'Team capacity', weight: 30, got: 17 },
  { label: 'Verified status', weight: 30, got: 20 },
  { label: 'Track record', weight: 20, got: 12 },
  { label: 'Skills match', weight: 20, got: 15 }]

}];


export function MatchingDemo({ live = true }: {live?: boolean;}) {
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!live || reduced) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % candidates.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [live, reduced]);

  const active = candidates[activeIndex];

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <ul className="space-y-1.5" aria-label="Ranked candidate exporters">
        {candidates.map((candidate, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={isActive}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${
                isActive ?
                'border-gate/45 bg-gate/10' :
                'border-hairline/5 bg-hairline/[0.02] hover:border-hairline/12'}`
                }>
                
                <span className="font-mono text-[11px] text-chalk-dim">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-chalk">{candidate.name}</span>
                  <span className="block font-mono text-[10px] text-chalk-dim">{candidate.natepId}</span>
                </span>
                <span
                  className={`font-display text-lg tabular-nums ${isActive ? 'text-gate-soft' : 'text-chalk-muted'}`}>
                  
                  {candidate.score}
                </span>
              </button>
            </li>);

        })}
      </ul>

      <div className="rounded-xl border border-hairline/6 bg-ink-800/80 p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Why this rank</p>
        <div className="mt-3 space-y-3">
          {active.factors.map((factor, index) =>
          <div key={factor.label}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12px] text-chalk-muted">{factor.label}</span>
                <span className="font-mono text-[11px] text-chalk-dim">
                  {factor.got}/{factor.weight}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-hairline/8">
                <motion.div
                key={`${active.id}-${factor.label}`}
                className="h-full rounded-full bg-gate"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${factor.got / factor.weight * 100}%` }}
                transition={{ duration: 0.28, ease: EASE, delay: reduced ? 0 : index * 0.04 }} />
              
              </div>
            </div>
          )}
        </div>
        <p className="mt-4 border-t border-hairline/6 pt-3 text-[11px] leading-relaxed text-chalk-dim">
          The score only ranks and explains. A NATEP officer decides who is introduced to the buyer.
        </p>
      </div>
    </div>);

}