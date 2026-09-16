import React from 'react';
import { BanIcon, XIcon } from 'lucide-react';
import { Reveal } from '../motion/Reveal';
import { SectionEyebrow } from '../site/SectionEyebrow';

const nonGoals = [
{ label: 'Stand-alone payment or escrow engine', why: 'Settlement stays with licensed banks and FX channels.' },
{ label: 'Open, unmoderated freelancer directory', why: 'Profiles are consent-gated and mediated by qualified demand.' },
{ label: 'Automated supplier selection or award', why: 'Scoring is decision support; a human always shortlists.' },
{ label: 'E-signature contracting tool', why: 'The Gateway records milestones and document hashes only.' },
{ label: 'New statutory obligations', why: 'Portal 2 compiles and routes regulator guidance; it creates none.' },
{ label: 'Blanket government endorsement', why: 'Badges reflect verified evidence, not opinion.' }];


export function Guardrails() {
  return (
    <section className="border-y border-hairline/6 bg-ink-800/30">
      <div className="mx-auto max-w-shell px-4 py-24 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <Reveal>
            <SectionEyebrow icon={BanIcon} tone="gold">
              Explicit non-goals
            </SectionEyebrow>
            <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[40px]">
              The boundaries are part of the design
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-chalk-muted">
              Scope discipline is what keeps the platform legally defensible and operationally honest. These exclusions
              are written into the mandate.
            </p>
          </Reveal>

          <ul className="divide-y divide-hairline/8">
            {nonGoals.map((item, index) =>
            <Reveal as="li" key={item.label} delay={index * 0.03}>
                <div className="flex items-start gap-4 py-4 first:pt-0">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-hairline/10 bg-hairline/[0.03]">
                    <XIcon className="h-3 w-3 text-chalk-dim" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-chalk">{item.label}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-chalk-muted">{item.why}</p>
                  </div>
                </div>
              </Reveal>
            )}
          </ul>
        </div>
      </div>
    </section>);

}