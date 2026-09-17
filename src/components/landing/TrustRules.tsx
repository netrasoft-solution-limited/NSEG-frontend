import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';
import { trustRules } from '../../data/landing';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { Reveal } from '../motion/Reveal';

/** "Why it can be trusted": the four published rules. */
export function TrustRules() {
  return (
    <section id="how-it-works" className="scroll-mt-28 border-y border-hairline/[0.03] bg-ink-800/30">
      <div className="mx-auto max-w-shell px-4 py-24 sm:py-28">
        <Reveal>
          <div className="max-w-2xl">
            <SectionEyebrow icon={ShieldCheckIcon}>Why it can be trusted</SectionEyebrow>
            <h2 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
              Built on evidence, not assertion
            </h2>
            <p className="mt-4 text-[15.5px] leading-relaxed text-chalk-muted">
              Four rules govern everything here. They are published so that you can hold the platform to them.
            </p>
          </div>
        </Reveal>

        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {trustRules.map((rule, index) =>
          <Reveal as="li" key={rule.title} delay={index * 0.04}>
              <div className="h-full rounded-3xl border border-hairline/10 bg-ink/60 p-6 sm:p-7">
                <span className="font-mono text-[12px] text-gate-soft">Rule {index + 1}</span>
                <h3 className="mt-2 font-display text-[20px] font-semibold tracking-[-0.01em] text-chalk">{rule.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-chalk-muted">{rule.body}</p>
              </div>
            </Reveal>
          )}
        </ol>

      </div>
    </section>);

}
