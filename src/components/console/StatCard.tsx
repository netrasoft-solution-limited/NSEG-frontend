import React from 'react';
import type { IconComponent } from '../../types/icons';

const gradients = {
  gate: 'from-gate/[0.09] via-white to-white',
  gold: 'from-gold/[0.10] via-white to-white',
  sky: 'from-sky/[0.10] via-white to-white',
  rose: 'from-rose-500/[0.08] via-white to-white'
} as const;

const squigglePaths = {
  gate: 'M2 20 C 14 6, 22 28, 34 14 S 54 4, 66 16',
  gold: 'M2 14 C 12 26, 24 4, 36 18 S 56 26, 66 10',
  sky: 'M2 22 C 16 10, 26 24, 38 12 S 52 8, 66 20',
  rose: 'M2 10 C 14 24, 24 6, 36 20 S 54 24, 66 12'
} as const;

interface StatCardProps {
  icon: IconComponent;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  accent: keyof typeof gradients;
}

export function StatCard({ icon: Icon, label, value, delta, positive, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-gradient-to-br p-5 ${gradients[accent]}`}>

      <div className="flex items-start justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm">
          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <svg width="68" height="30" viewBox="0 0 68 30" fill="none" aria-hidden="true">
          <path
            d={squigglePaths[accent]}
            stroke={positive ? '#008751' : '#e11d48'}
            strokeWidth="1.5"
            strokeLinecap="round" />

        </svg>
      </div>
      <p className="mt-4 text-[13px] text-gray-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">{value}</span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
          positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`
          }>

          {delta}
        </span>
      </div>
    </div>);

}
