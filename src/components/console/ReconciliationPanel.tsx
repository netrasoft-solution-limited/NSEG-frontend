import React from 'react';
import { CheckIcon } from 'lucide-react';
import type { InstitutionReconciliation, ReconciliationStatus } from '../../data/observatory';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface ReconciliationPanelProps {
  institutions: InstitutionReconciliation[];
  overrides: Record<string, ReconciliationStatus>;
  onResolve: (institution: string) => void;
  canMutate: boolean;
}

const statusStyles: Record<ReconciliationStatus, string> = {
  reconciled: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  flagged: 'bg-rose-50 text-rose-700'
};

const statusLabels: Record<ReconciliationStatus, string> = {
  reconciled: 'Reconciled',
  pending: 'Pending sync',
  flagged: 'Flagged'
};

export function ReconciliationPanel({ institutions, overrides, onResolve, canMutate }: ReconciliationPanelProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-gray-900">Institution reconciliation</h2>
      <p className="text-[12.5px] text-gray-400">
        Cross-checked against NEPC, NEXIM, CBN and FIRS so one contract is never counted twice.
      </p>

      <ul className="mt-4 space-y-2">
        {institutions.map((item) => {
          const status = overrides[item.institution] ?? item.status;
          return (
            <li
              key={item.institution}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{item.institution}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyles[status]}`}>
                    {statusLabels[status]}
                  </span>
                </div>
                <p className="text-[12.5px] text-gray-400">{item.fullName} · Last synced {item.lastSynced}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {item.flaggedClaims > 0 &&
                <span className="text-[12.5px] font-medium text-rose-600">
                    {item.flaggedClaims} flagged {item.flaggedClaims === 1 ? 'claim' : 'claims'}
                  </span>
                }
                {status !== 'reconciled' && !canMutate && <AuditOnlyBadge />}
                {status !== 'reconciled' && canMutate &&
                <button
                  type="button"
                  onClick={() => onResolve(item.institution)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                    <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Resolve &amp; reconcile
                  </button>
                }
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
