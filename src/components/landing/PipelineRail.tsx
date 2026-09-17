import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheckIcon, ClipboardCheckIcon, HandshakeIcon, KeyRoundIcon, RadioTowerIcon, ScaleIcon } from "lucide-react";
import type { IconComponent } from "../../types/icons";
import { pipelineStages, StageIcon } from "../../data/site";
import { EASE } from "../motion/Reveal";
const stageIcons: Record<StageIcon, IconComponent> = {
  signal: RadioTowerIcon,
  review: ClipboardCheckIcon,
  match: ScaleIcon,
  consent: KeyRoundIcon,
  contract: HandshakeIcon,
  verified: BadgeCheckIcon
};
export function PipelineRail({
  compact = false


}: {compact?: boolean;}) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % pipelineStages.length), 1800);
    return () => window.clearInterval(timer);
  }, [reduced]);
  return <div className="rounded-3xl border border-hairline/10 bg-ink-800/80 p-5 sm:p-7">
      <ol aria-label="Opportunity lifecycle stages" className={`grid gap-x-4 gap-y-7 grid-cols-2 sm:grid-cols-3 ${compact ? '' : 'lg:grid-cols-6'}`}>
        {pipelineStages.map((stage, index) => {
        const Icon = stageIcons[stage.icon];
        const isActive = index === active;
        const isPassed = index < active;
        const isLast = index === pipelineStages.length - 1;
        return <li key={stage.id} className="relative">
              <div className="flex items-center gap-2">
                <motion.span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200 ease-out ${isActive ? 'border-gate/50 bg-gate/15 text-gate-soft' : isPassed ? 'border-hairline/12 bg-hairline/[0.06] text-chalk-muted' : 'border-hairline/10 bg-hairline/[0.02] text-chalk-dim'}`} animate={reduced || !isActive ? {
              scale: 1
            } : {
              scale: [1, 1.06, 1]
            }} transition={{
              duration: 0.3,
              ease: EASE
            }}>
                  <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                </motion.span>

                {!isLast && !compact && <span className="hidden h-[1.5px] flex-1 overflow-hidden rounded-full bg-hairline/10 lg:block">
                    <motion.span className="block h-full rounded-full bg-gate" animate={{
                width: isPassed ? '100%' : isActive ? '55%' : '0%'
              }} transition={reduced ? {
                duration: 0
              } : {
                duration: 0.3,
                ease: EASE
              }} />
                  </span>}
              </div>

              <p className={`mt-3 text-[13.5px] font-semibold leading-snug transition-colors duration-200 ease-out ${isActive ? 'text-chalk' : 'text-chalk-muted'}`}>
                <span className="mr-1.5 font-mono text-[11px] font-normal text-chalk-dim">{String(index + 1).padStart(2, '0')}</span>
                {stage.label}
              </p>
              <p className="mt-1 text-[12.5px] leading-snug text-chalk-dim">{stage.detail}</p>

            </li>;
      })}
      </ol>
    </div>;
}