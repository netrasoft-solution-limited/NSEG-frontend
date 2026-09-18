import React from 'react';
import { RouteIcon } from 'lucide-react';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { Reveal } from '../motion/Reveal';
import { PipelineRail } from './PipelineRail';

/** The opportunity lifecycle, given its own section rather than sitting under the hero. The
 * stages are a real sequence, so they're numbered. */
export function LifecycleSection() {
  return (
    <section id="lifecycle" className="mx-auto max-w-shell px-4 py-24 sm:py-28">
      <Reveal>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <SectionEyebrow icon={RouteIcon}>Opportunity lifecycle</SectionEyebrow>
            <h2 className="mt-4 text-balance font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
              How an opportunity moves through the Gateway
            </h2>
          </div>
          <p className="max-w-md text-[15px] leading-relaxed text-chalk-muted">
            Every opportunity follows the same six stages. None can be skipped, and each hand-off is recorded — from a
            buyer's first signal to an outcome that is counted once.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mt-10">
          <PipelineRail />
        </div>
      </Reveal>
    </section>);

}
