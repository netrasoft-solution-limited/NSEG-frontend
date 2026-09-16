import React from "react";
import type { IconComponent } from "../../types/icons";
interface SectionEyebrowProps {
  icon?: IconComponent;
  children: React.ReactNode;
  tone?: 'gate' | 'gold';
}
export function SectionEyebrow({
  icon: Icon,
  children,
  tone = 'gate'
}: SectionEyebrowProps) {
  const toneClasses = tone === 'gold' ? 'border-gold/25 bg-gold/[0.08] text-gold' : 'border-gate/25 bg-gate/[0.08] text-gate-soft';
  return <p className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] ${toneClasses}`}>
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </p>;
}