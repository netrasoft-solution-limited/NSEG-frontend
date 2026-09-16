import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ActivityIcon, FolderOpenIcon, TimerIcon, UsersIcon } from "lucide-react";
import type { IconComponent } from "../../types/icons";
import { headlineMetric, supportingMetrics } from "../../data/observatory";
import { Reveal } from "../motion/Reveal";
import { SectionEyebrow } from "../site/SectionEyebrow";
import { ObservatoryDemo } from "../demos/ObservatoryDemo";
const metricIcons: IconComponent[] = [UsersIcon, FolderOpenIcon, TimerIcon];
function useCountUp(target: number, run: boolean) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced || !run) {
      if (reduced) setValue(target);
      return;
    }
    let frame = 0;
    const total = 34;
    const tick = () => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setValue(Number((target * eased).toFixed(2)));
      if (frame < total) requestAnimationFrame(tick);else setValue(target);
    };
    const handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [reduced, run, target]);
  return value;
}
export function ObservatorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: '-20% 0px'
  });
  const value = useCountUp(headlineMetric.value, inView);
  return <section id="observatory" className="mx-auto max-w-shell px-4 py-24 sm:py-32">
      <div ref={ref} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-16">
        <Reveal>
          <SectionEyebrow icon={ActivityIcon}>National Observatory</SectionEyebrow>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[40px]">
            Policy that reads from the live ledger
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-chalk-muted">
            Operational events from all three portals stream into a curated indicator pipeline — anonymised, weighted by
            confidence, and reconciled so one contract is counted exactly once.
          </p>

          <div className="mt-10">
            <p className="font-display text-[56px] font-semibold leading-none tracking-[-0.03em] text-chalk sm:text-[72px]">
              ${value.toFixed(2)}
              <span className="ml-2 align-baseline text-[20px] font-medium text-gate sm:text-[24px]">
                {headlineMetric.unit}
              </span>
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-chalk-muted">{headlineMetric.label}</p>
            <p className="mt-1 font-mono text-[11px] text-chalk-dim">{headlineMetric.note}</p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline/8 pt-8 sm:grid-cols-3">
            {supportingMetrics.map((metric, index) => {
            const Icon = metricIcons[index] ?? UsersIcon;
            return <div key={metric.label}>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline/10 bg-hairline/[0.04] text-gate-soft">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <dt className="mt-3 text-[11.5px] leading-snug text-chalk-dim">{metric.label}</dt>
                  <dd className="mt-1.5 font-display text-[22px] font-semibold text-chalk">{metric.value}</dd>
                </div>;
          })}
          </dl>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="h-full rounded-2xl border border-hairline/8 bg-ink-800/60 p-5 sm:p-6">
            <ObservatoryDemo />
          </div>
        </Reveal>
      </div>
    </section>;
}