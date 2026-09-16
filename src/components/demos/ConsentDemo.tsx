import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../motion/Reveal';

const fields = [
{ id: 'name', label: 'Legal name', value: 'Apex Software Global Ltd' },
{ id: 'certs', label: 'Verified certifications', value: 'NITDA · ISO 27001' },
{ id: 'nin', label: 'Director ID number', value: '*******5678' },
{ id: 'bank', label: 'Bank account', value: '**** 0091' }];


export function ConsentDemo() {
  const reduced = useReducedMotion();
  const [granted, setGranted] = useState<string[]>(['name', 'certs']);

  const toggle = (id: string) =>
  setGranted((current) => current.includes(id) ? current.filter((f) => f !== id) : [...current, id]);

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <ul className="space-y-1.5">
        {fields.map((field) => {
          const isOn = granted.includes(field.id);
          return (
            <li key={field.id}>
              <button
                type="button"
                onClick={() => toggle(field.id)}
                aria-pressed={isOn}
                className="flex w-full items-center gap-3 rounded-lg border border-hairline/6 bg-hairline/[0.03] px-3 py-2 text-left transition-colors duration-150 ease-out hover:border-hairline/14">
                
                <span
                  className={`relative h-4 w-7 shrink-0 rounded-full transition-colors duration-150 ease-out ${
                  isOn ? 'bg-gate' : 'bg-hairline/14'}`
                  }>
                  
                  <motion.span
                    className="absolute top-0.5 h-3 w-3 rounded-full bg-black"
                    animate={{ left: isOn ? 14 : 2 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.16, ease: EASE }} />
                  
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] text-chalk">{field.label}</span>
                  <span className="block truncate font-mono text-[10.5px] text-chalk-dim">
                    {isOn ? field.value : 'withheld'}
                  </span>
                </span>
              </button>
            </li>);

        })}
      </ul>

      <p className="text-[11px] leading-relaxed text-chalk-dim">
        {granted.length} of 4 details shared with one named buyer, and the link expires in 15 minutes. Anything you
        switch off stays hidden.
      </p>
    </div>);

}