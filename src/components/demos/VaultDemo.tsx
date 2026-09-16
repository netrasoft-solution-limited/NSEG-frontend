import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckIcon, FileTextIcon, LinkIcon } from 'lucide-react';
import { EASE } from '../motion/Reveal';

const steps = [
{ label: 'Company certificate uploaded', state: 'Checked and stored securely', icon: 'check' as const },
{ label: 'Another portal asks for it', state: 'Recognised as the same file', icon: 'link' as const },
{ label: 'Re-used automatically', state: 'Nothing to upload again', icon: 'check' as const }];


export function VaultDemo({ live = true }: {live?: boolean;}) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(live && !reduced ? 0 : steps.length - 1);

  useEffect(() => {
    if (!live || reduced) return;
    const timer = window.setInterval(() => setStep((s) => (s + 1) % (steps.length + 1)), 1400);
    return () => window.clearInterval(timer);
  }, [live, reduced]);

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <ul className="space-y-1.5">
        {steps.map((item, index) => {
          const reached = index <= step;
          return (
            <li
              key={item.label}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-200 ease-out ${
              reached ? 'border-gate/35 bg-gate/[0.07]' : 'border-hairline/6 bg-hairline/[0.02]'}`
              }>
              
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                reached ? 'bg-gate/20 text-gate-soft' : 'bg-hairline/6 text-chalk-dim'}`
                }>
                
                {item.icon === 'link' ?
                <LinkIcon className="h-3 w-3" aria-hidden="true" /> :
                reached ?
                <CheckIcon className="h-3 w-3" aria-hidden="true" /> :

                <FileTextIcon className="h-3 w-3" aria-hidden="true" />
                }
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] text-chalk">{item.label}</span>
                <span className="block truncate font-mono text-[10.5px] text-chalk-dim">{item.state}</span>
              </span>
            </li>);

        })}
      </ul>

      <motion.p
        key={step}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="text-[11px] leading-relaxed text-chalk-dim">
        
        Documents are fingerprinted, so the same paperwork is never collected twice.
      </motion.p>
    </div>);

}