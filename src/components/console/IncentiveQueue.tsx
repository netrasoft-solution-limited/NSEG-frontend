import React from 'react';
import { CheckIcon, LockIcon, SparklesIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import { incentiveTypeLabels, type IncentiveApplication, type IncentiveReviewStatus } from '../../data/incentives';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface IncentiveQueueProps {
  applications: IncentiveApplication[];
  actorsById: Map<string, Actor>;
  decisions: Record<string, IncentiveReviewStatus>;
  onDecide: (id: string, status: IncentiveReviewStatus) => void;
  /** BR-P2-05.3's two-tier workflow: auto pre-qualification, then final sign-off
   * reserved for a designated NATEP/NEPC Administrator. Declining isn't a grant of
   * funds, so any officer can still decline. */
  canApprove: boolean;
  canMutate: boolean;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function IncentiveQueue({ applications, actorsById, decisions, onDecide, canApprove, canMutate }: IncentiveQueueProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Incentive applications</h2>
        <p className="text-[12.5px] text-gray-400">
          Auto pre-qualification is a fast-track, not a decision — sign-off still requires an officer.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {applications.map((application) => {
          const actor = actorsById.get(application.actorId);
          const status = decisions[application.id] ?? application.reviewStatus;

          return (
            <li
              key={application.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              status === 'approved' ?
              'border-emerald-200 bg-emerald-50/40' :
              status === 'declined' ?
              'border-gray-100 bg-gray-50 opacity-70' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor?.name ?? 'Unknown exporter'}</p>
                    <span className="font-mono text-[10.5px] text-gray-400">{actor?.natepId}</span>
                    {application.autoPreQualified &&
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10.5px] font-medium text-sky-700">
                        <SparklesIcon className="h-3 w-3" aria-hidden="true" />
                        Auto pre-qualified
                      </span>
                    }
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {incentiveTypeLabels[application.type]} · Submitted {application.submittedOn}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-600">
                    Requesting <span className="font-semibold text-gray-900">{currency.format(application.requestedAmount)}</span> against{' '}
                    {currency.format(application.verifiedExportVolume)} in verified escrow export volume.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'pending' && !canMutate && <AuditOnlyBadge />}
                  {status === 'pending' && canMutate &&
                  <>
                      {canApprove ?
                    <button
                      type="button"
                      onClick={() => onDecide(application.id, 'approved')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Approve
                        </button> :

                    <span
                      title="Final sign-off is reserved for a NATEP/NEPC Administrator"
                      className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-400">

                          <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Needs Administrator sign-off
                        </span>
                    }
                      <button
                    type="button"
                    onClick={() => onDecide(application.id, 'declined')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Decline
                      </button>
                    </>
                  }
                  {status === 'approved' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Approved
                    </span>
                  }
                  {status === 'declined' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Declined
                    </span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
