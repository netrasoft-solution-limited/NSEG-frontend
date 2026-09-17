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
  return <div className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-sm sm:p-5">
      <div className="border-b border-white/8 pb-3.5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Opportunity lifecycle</p>
      </div>

      <ol className={`mt-4 grid gap-x-3 gap-y-5 grid-cols-2 sm:grid-cols-3 ${compact ? '' : 'lg:grid-cols-6'}`}>
        {pipelineStages.map((stage, index) => {
        const Icon = stageIcons[stage.icon];
        const isActive = index === active;
        const isPassed = index < active;
        const isLast = index === pipelineStages.length - 1;
        return <li key={stage.id} className="relative">
              <div className="flex items-center gap-2">
                <motion.span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200 ease-out ${isActive ? 'border-gate/50 bg-gate/15 text-[#8ce3b6]' : isPassed ? 'border-white/12 bg-white/[0.06] text-white/60' : 'border-white/8 bg-white/[0.02] text-white/40'}`} animate={reduced || !isActive ? {
              scale: 1
            } : {
              scale: [1, 1.06, 1]
            }} transition={{
              duration: 0.3,
              ease: EASE
            }}>
                  <Icon className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
                </motion.span>

                {!isLast && !compact && <span className="hidden h-[1.5px] flex-1 overflow-hidden rounded-full bg-white/8 lg:block">
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

              <p className={`mt-3 text-[12.5px] font-medium leading-snug transition-colors duration-200 ease-out ${isActive ? 'text-white' : 'text-white/60'}`}>
                {stage.label}
              </p>

            </li>;
      })}
      </ol>
    </div>;
}