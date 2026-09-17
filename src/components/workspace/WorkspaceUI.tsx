import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';

/** Small shared pieces for the exporter and buyer workspaces, so every screen composes the
 * same stat tiles, callouts, timelines and tags. */

export function StatGrid({ children }: {children: React.ReactNode;}) {
  return <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</dl>;
}

export function Stat({ label, value, detail }: {label: string;value: React.ReactNode;detail: string;}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <dt className="text-[12.5px] font-medium text-gray-600">{label}</dt>
      <dd>
        <span className="mt-1 block font-display text-[28px] font-semibold leading-tight tabular-nums text-gray-900">{value}</span>
        <span className="mt-0.5 block text-[12px] text-gray-600">{detail}</span>
      </dd>
    </div>);

}

type Tone = 'green' | 'gold' | 'clay' | 'neutral';

const calloutTones: Record<Tone, string> = {
  green: 'border-emerald-300 bg-emerald-50',
  gold: 'border-amber-300 bg-amber-50',
  clay: 'border-rose-300 bg-rose-50',
  neutral: 'border-gray-200 bg-white'
};

/** A highlighted "you have something to do" band with one action. */
export function Callout({
  tone,
  title,
  children,
  action




}: {tone: Tone;title: string;children?: React.ReactNode;action?: {label: string;to: string;};}) {
  return (
    <section className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${calloutTones[tone]}`}>
      <div className="min-w-0 max-w-2xl">
        <h2 className="text-[16.5px] font-semibold text-gray-900">{title}</h2>
        {children && <p className="mt-1 text-[13.5px] leading-relaxed text-gray-700">{children}</p>}
      </div>
      {action &&
      <Link
        to={action.to}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">

          {action.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      }
    </section>);

}

export function Panel({
  title,
  intro,
  aside,
  children,
  id




}: {title: string;intro?: string;aside?: React.ReactNode;children: React.ReactNode;id?: string;}) {
  const headingId = id ?? `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id={headingId} className="text-[16px] font-semibold text-gray-900">
          {title}
        </h2>
        {aside}
      </div>
      {intro && <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>);

}

export type TimelineState = 'done' | 'now' | 'later';

/** A real sequence of stages, with where things stand. */
export function Timeline({ steps }: {steps: {title: string;detail: string;state: TimelineState;}[];}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) =>
      <li key={step.title} className="relative flex gap-3 pb-4 last:pb-0" aria-current={step.state === 'now' ? 'step' : undefined}>
          {index < steps.length - 1 &&
        <span
          aria-hidden="true"
          className={`absolute left-[11px] top-7 h-[calc(100%-24px)] w-px ${step.state === 'done' ? 'bg-emerald-400' : 'bg-gray-200'}`} />

        }
          <span
          className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          step.state === 'done' ?
          'bg-emerald-600 text-white' :
          step.state === 'now' ?
          'bg-amber-100 text-amber-700 ring-4 ring-amber-50' :
          'border border-gray-300 bg-white text-gray-400'}`
          }>

            {step.state === 'done' ?
          <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> :

          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          }
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-gray-900">
              {step.title}
              <span className="sr-only">{step.state === 'done' ? ' (done)' : step.state === 'now' ? ' (current)' : ''}</span>
            </p>
            <p className="text-[13px] leading-relaxed text-gray-600">{step.detail}</p>
          </div>
        </li>
      )}
    </ol>);

}

const tagTones: Record<Tone | 'ok', string> = {
  ok: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  gold: 'bg-amber-50 text-amber-900 ring-amber-200',
  clay: 'bg-rose-50 text-rose-800 ring-rose-200',
  neutral: 'bg-gray-100 text-gray-700 ring-gray-200'
};

export function Tag({ tone = 'neutral', children }: {tone?: Tone | 'ok';children: React.ReactNode;}) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium ring-1 ring-inset ${tagTones[tone]}`}>
      {children}
    </span>);

}

export function KeyValue({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] font-medium text-gray-900">{children}</dd>
    </div>);

}

export function EmptyState({ title, children, action }: {title: string;children: React.ReactNode;action?: React.ReactNode;}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
      <h2 className="text-[16px] font-semibold text-gray-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-[13.5px] leading-relaxed text-gray-600">{children}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>);

}

/** A scrollable data table in a card; rows stay readable on phones by scrolling sideways. */
export function DataTable({ head, children, label }: {head: string[];children: React.ReactNode;label: string;}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {head.map((cell, index) =>
              <th key={index} scope="col" className="px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-gray-600">
                  {cell}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">{children}</tbody>
        </table>
      </div>
    </div>);

}

export const primaryLinkClass =
'inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white transition-colors duration-150 hover:bg-black';

/** The same action on a dark panel. */
export const onDarkLinkClass =
'inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white px-5 text-[13.5px] font-semibold text-gray-900 shadow-sm hover:bg-gray-100';
