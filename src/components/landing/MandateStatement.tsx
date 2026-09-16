import React, { useRef } from "react";
import { MotionValue, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CopyIcon, EyeOffIcon, NetworkIcon, ScrollTextIcon } from "lucide-react";
import type { IconComponent } from "../../types/icons";
import { SectionEyebrow } from "../site/SectionEyebrow";
const statement = 'Nigeria does not lack service capability. It lacks one place where demand is qualified, compliance is authoritative, and supply is verifiable — without collecting the same evidence three times.';
const bottlenecks: {
  icon: IconComponent;
  term: string;
  detail: string;
}[] = [{
  icon: NetworkIcon,
  term: 'Fragmented market access',
  detail: 'Buyer procurement, missions and diaspora leads captured in silos, never systematically matched.'
}, {
  icon: ScrollTextIcon,
  term: 'Compliance blind spots',
  detail: 'No single source-linked register of statutory, professional, fiscal and FX requirements.'
}, {
  icon: EyeOffIcon,
  term: 'Invisible supply',
  detail: 'No standardised capability metrics, verified capacity data, or improvement pathways.'
}, {
  icon: CopyIcon,
  term: 'Double-counted exports',
  detail: 'Four institutions, four data models, and the same contract claimed more than once.'
}];
function Word({
  children,
  progress,
  range




}: {children: string;progress: MotionValue<number>;range: [number, number];}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return <motion.span style={{
    opacity
  }} className="inline-block">
      {children}&nbsp;
    </motion.span>;
}
export function MandateStatement() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.32']
  });
  const words = statement.split(' ');
  return <section className="mx-auto max-w-shell px-4 py-24 sm:py-32" aria-label="Programme rationale">
      <div ref={ref} className="mx-auto max-w-3xl">
        <SectionEyebrow tone="gold">The problem, precisely</SectionEyebrow>
        <p className="mt-6 font-display text-[26px] font-medium leading-[1.28] tracking-[-0.015em] text-chalk sm:text-[34px]">
          {reduced ? statement : words.map((word, index) => <Word key={`${word}-${index}`} progress={scrollYProgress} range={[index / words.length, (index + 1) / words.length]}>
                  {word}
                </Word>)}
        </p>
        <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-hairline/8 pt-8 sm:grid-cols-2">
          {bottlenecks.map((item) => <div key={item.term} className="flex gap-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-hairline/10 bg-hairline/[0.04] text-gold">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <dt className="text-[14px] font-semibold text-chalk">{item.term}</dt>
                <dd className="mt-1.5 text-[13.5px] leading-relaxed text-chalk-muted">{item.detail}</dd>
              </div>
            </div>)}
        </dl>
      </div>
    </section>;
}