import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import type { Signal } from '../../data/signals';
import { sectorLabel } from '../../lib/marketplaceLookups';
import { AuditOnlyBadge } from './AuditOnlyBadge';

export type SignalDecision = 'pending' | 'qualified' | 'rejected';

const riskStyles: Record<Signal['riskTier'], string> = {
  New: 'bg-sky-50 text-sky-700',
  Review: 'bg-amber-50 text-amber-700',
  Flagged: 'bg-rose-50 text-rose-700'
};

interface SignalQueueProps {
  signals: Signal[];
  decisions: Record<string, SignalDecision>;
  onDecide: (id: string, decision: SignalDecision) => void;
  canMutate: boolean;
}

export function SignalQueue({ signals, decisions, onDecide, canMutate }: SignalQueueProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Signal intake</h2>
        <p className="text-[12.5px] text-gray-400">Every inbound buyer signal waits here until an officer qualifies or rejects it.</p>
      </div>

      <ul className="mt-4 space-y-2">
        {signals.map((signal) => {
          const decision = decisions[signal.id] ?? 'pending';
          return (
            <li
              key={signal.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              decision === 'qualified' ?
              'border-emerald-200 bg-emerald-50/40' :
              decision === 'rejected' ?
              'border-gray-100 bg-gray-50 opacity-60' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{signal.route}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${riskStyles[signal.riskTier]}`}>
                      {signal.riskTier}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {signal.origin} · {sectorLabel(signal.sectorCode)} · Received {signal.receivedOn}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-500">{signal.summary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {decision === 'pending' && !canMutate && <AuditOnlyBadge />}
                  {decision === 'pending' && canMutate &&
                  <>
                      <button
                    type="button"
                    onClick={() => onDecide(signal.id, 'qualified')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Qualify
                      </button>
                      <button
                    type="button"
                    onClick={() => onDecide(signal.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  }
                  {decision === 'qualified' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Qualified
                    </span>
                  }
                  {decision === 'rejected' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Rejected
                    </span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
