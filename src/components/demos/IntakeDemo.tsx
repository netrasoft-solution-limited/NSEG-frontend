import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../motion/Reveal';

const signals = [
{ route: 'Buyer enquiry form', origin: 'Rotterdam, Netherlands', risk: 'New' },
{ route: 'Trade mission lead', origin: 'Dubai, UAE', risk: 'New' },
{ route: 'Partner referral', origin: 'New York, USA', risk: 'New' },
{ route: 'Diaspora network', origin: 'London, UK', risk: 'New' }];


export function IntakeDemo({ live = true }: {live?: boolean;}) {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!live || reduced) return;
    const timer = window.setInterval(() => setCursor((c) => c + 1), 2100);
    return () => window.clearInterval(timer);
  }, [live, reduced]);

  const visible = [0, 1, 2].map((offset) => {
    const signal = signals[(cursor + offset) % signals.length];
    return { ...signal, key: `${cursor + offset}` };
  });

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <ul className="space-y-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((signal, index) =>
          <motion.li
            key={signal.key}
            layout
            initial={reduced ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: index === 0 ? 1 : 0.55 - index * 0.14, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="flex items-center justify-between gap-3 rounded-lg border border-hairline/6 bg-hairline/[0.03] px-3 py-2">
            
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-chalk">{signal.route}</span>
                <span className="block truncate text-[10.5px] text-chalk-dim">{signal.origin}</span>
              </span>
              <span className="shrink-0 rounded-full border border-hairline/10 px-2 py-0.5 font-mono text-[10px] text-chalk-muted">
                {signal.risk}
              </span>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>

      <div className="flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.08] px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="text-[11px] text-gold">Waiting for officer review</span>
      </div>
    </div>);

}