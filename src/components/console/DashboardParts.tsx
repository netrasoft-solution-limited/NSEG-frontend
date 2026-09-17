import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Counts up to a figure once, so a dashboard reads as live rather than printed. */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '' }: {to: number;decimals?: number;prefix?: string;suffix?: string;}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : 0);
  const frame = useRef<number>();

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const duration = 900;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out, so the number settles rather than stopping dead.
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [to, reduced]);

  return (
    <span className="tabular-nums">
      {prefix}
      {value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>);

}

export interface PipelineStep {
  label: string;
  detail: string;
  count: number;
}

/** The national pipeline as a row of columns: how many cases sit at each stage, and how many
 * carried through from the one before. */
export function PipelineFlow({ steps }: {steps: PipelineStep[];}) {
  const reduced = useReducedMotion();
  const peak = Math.max(...steps.map((step) => step.count), 1);

  return (
    <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {steps.map((step, index) => {
        const height = Math.max(12, Math.round(step.count / peak * 100));
        return (
          <li key={step.label} className="relative rounded-2xl bg-gray-50 p-3.5 ring-1 ring-inset ring-gray-200/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-500">{`0${index + 1}`}</p>
            <p className="mt-2 font-display text-[26px] font-semibold leading-none text-gray-900">
              <CountUp to={step.count} />
            </p>
            <p className="mt-1.5 text-[13px] font-semibold text-gray-900">{step.label}</p>
            <p className="mt-0.5 text-[11.5px] leading-snug text-gray-500">{step.detail}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-gate to-gate-tint"
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${height}%` }}
                transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }} />

            </div>
          </li>);

      })}
    </ol>);

}

/** A radial gauge for a figure against its quarterly target. */
export function ValueGauge({
  value,
  target,
  unit,
  caption




}: {value: number;target: number;unit: string;caption: string;}) {
  const reduced = useReducedMotion();
  const share = Math.min(value / target, 1);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[196px] w-[196px]">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
          <defs>
            <linearGradient id="gauge-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0B6E4F" />
              <stop offset="60%" stopColor="#4FB68F" />
              <stop offset="100%" stopColor="#E0B25C" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#E3E1D6" strokeWidth="14" />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#gauge-stroke)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={reduced ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - share) }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />

        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-[34px] font-semibold leading-none tracking-[-0.02em] text-gray-900">
            <CountUp to={value} decimals={2} prefix="$" />
            <span className="text-[18px] text-gray-500">{unit}</span>
          </p>
          <p className="mt-1 text-[12px] font-medium text-gray-600">{Math.round(share * 100)}% of target</p>
        </div>
      </div>
      <p className="mt-3 max-w-[260px] text-center text-[12.5px] leading-relaxed text-gray-600">{caption}</p>
    </div>);

}

/** Horizontal bars for a share breakdown, e.g. value by service or by state. */
export function ShareBars({ rows, unit }: {rows: {label: string;value: number;note?: string;}[];unit?: string;}) {
  const reduced = useReducedMotion();
  const peak = Math.max(...rows.map((row) => row.value), 1);

  return (
    <ul className="space-y-3">
      {rows.map((row, index) =>
      <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] text-gray-800">{row.label}</span>
            <span className="shrink-0 font-mono text-[12px] tabular-nums text-gray-600">
              {row.note ?? `${row.value}${unit ?? ''}`}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
            <motion.div
            className="h-full rounded-full bg-gate/75"
            initial={reduced ? false : { width: 0 }}
            animate={{ width: `${row.value / peak * 100}%` }}
            transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }} />

          </div>
        </li>
      )}
    </ul>);

}
