import React, { useState } from 'react';
import { CheckIcon, RefreshCwIcon } from 'lucide-react';
import type { Opportunity } from '../../data/opportunities';
import type { Shortlist } from '../../data/shortlists';
import { sectorLabel, modeLabel } from '../../lib/marketplaceLookups';
import { AuditOnlyBadge } from './AuditOnlyBadge';

export type ShortlistDecision = 'pending' | 'approved' | 'adjust';

interface ShortlistCardProps {
  opportunity: Opportunity;
  shortlist: Shortlist;
  decision: ShortlistDecision;
  onDecide: (opportunityId: string, decision: ShortlistDecision) => void;
  canMutate: boolean;
}

function ShortlistCard({ opportunity, shortlist, decision, onDecide, canMutate }: ShortlistCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = shortlist.candidates[activeIndex];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gray-400">
            {sectorLabel(opportunity.sectorCode)} · {modeLabel(opportunity.mode)}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold text-gray-900">{opportunity.title}</h3>
          <p className="text-[12.5px] text-gray-400">{opportunity.buyerRegion}</p>
        </div>

        {decision === 'pending' && !canMutate && <AuditOnlyBadge />}
        {decision === 'pending' && canMutate &&
        <div className="flex shrink-0 items-center gap-2">
            <button
            type="button"
            onClick={() => onDecide(opportunity.id, 'approved')}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

              <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Approve shortlist
            </button>
            <button
            type="button"
            onClick={() => onDecide(opportunity.id, 'adjust')}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

              <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Request adjustment
            </button>
          </div>
        }
        {decision === 'approved' &&
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
            <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Shortlist approved
          </span>
        }
        {decision === 'adjust' &&
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-[12px] font-semibold text-amber-700">
            <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Adjustment requested
          </span>
        }
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <ul className="space-y-1.5">
          {shortlist.candidates.map((candidate, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={candidate.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors duration-150 ease-out ${
                  isActive ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`
                  }>

                  <span className="font-mono text-[11px] text-gray-400">{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-gray-900">{candidate.name}</span>
                    <span className="block font-mono text-[10px] text-gray-400">{candidate.natepId}</span>
                  </span>
                  <span className={`text-lg font-semibold tabular-nums ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {candidate.score}
                  </span>
                </button>
              </li>);

          })}
        </ul>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] uppercase tracking-[0.08em] text-gray-400">Why this rank</p>
          <div className="mt-3 space-y-3">
            {active.factors.map((factor) =>
            <div key={factor.label}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[12px] text-gray-600">{factor.label}</span>
                  <span className="font-mono text-[11px] text-gray-400">{factor.got}/{factor.weight}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                  className="h-full rounded-full bg-gray-900"
                  style={{ width: `${factor.got / factor.weight * 100}%` }} />

                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

}

interface ShortlistReviewProps {
  items: { opportunity: Opportunity; shortlist: Shortlist }[];
  decisions: Record<string, ShortlistDecision>;
  onDecide: (opportunityId: string, decision: ShortlistDecision) => void;
  canMutate: boolean;
}

export function ShortlistReview({ items, decisions, onDecide, canMutate }: ShortlistReviewProps) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-[16px] font-semibold text-gray-900">Shortlists awaiting approval</h2>
        <p className="text-[12.5px] text-gray-400">Scores only rank and explain — an officer decides who's introduced to the buyer.</p>
      </div>
      <div className="space-y-4">
        {items.map(({ opportunity, shortlist }) =>
        <ShortlistCard
          key={opportunity.id}
          opportunity={opportunity}
          shortlist={shortlist}
          decision={decisions[opportunity.id] ?? 'pending'}
          onDecide={onDecide}
          canMutate={canMutate} />

        )}
      </div>
    </div>);

}
