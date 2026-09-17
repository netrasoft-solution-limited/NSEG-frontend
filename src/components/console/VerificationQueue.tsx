import React from 'react';
import { AlertTriangleIcon, CheckIcon, XIcon } from 'lucide-react';
import type { VerificationQueueStatus } from '../../lib/verification';

export type VerificationDecision = 'approved' | 'rejected';

/** The subset of an exporter (Actor) or buyer record this queue needs to render —
 * shared because both registries run through the same hybrid JIT verification flow. */
export interface VerifiableEntity {
  id: string;
  name: string;
  referenceId: string;
  verificationQueue: VerificationQueueStatus;
  verificationNote?: string;
}

interface VerificationQueueProps {
  entities: VerifiableEntity[];
  decisions: Record<string, VerificationDecision>;
  onDecide: (entityId: string, decision: VerificationDecision) => void;
}

export function VerificationQueue({ entities, decisions, onDecide }: VerificationQueueProps) {
  const queued = entities.filter((entity) => entity.verificationQueue !== 'none' && !decisions[entity.id]);
  const resolved = entities.filter((entity) => entity.verificationQueue !== 'none' && decisions[entity.id]);

  if (queued.length === 0 && resolved.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Verification queue</h2>
        <p className="text-[12.5px] text-gray-400">
          Accounts the hybrid JIT pipeline couldn't clear automatically — 1-click manual review, no account lockout.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {[...queued, ...resolved].map((entity) => {
          const decision = decisions[entity.id];
          const isFlagged = entity.verificationQueue === 'flagged';
          return (
            <li
              key={entity.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              decision === 'approved' ?
              'border-emerald-200 bg-emerald-50/40' :
              decision === 'rejected' ?
              'border-gray-100 bg-gray-50 opacity-60' :
              isFlagged ?
              'border-rose-200 bg-rose-50/40' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{entity.name}</p>
                    <span className="font-mono text-[10.5px] text-gray-400">{entity.referenceId}</span>
                    {isFlagged &&
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] font-medium text-rose-700">
                        <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
                        Flagged
                      </span>
                    }
                  </div>
                  <p className="mt-1 text-[12.5px] text-gray-500">{entity.verificationNote}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!decision &&
                  <>
                      <button
                    type="button"
                    onClick={() => onDecide(entity.id, 'approved')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </button>
                      <button
                    type="button"
                    onClick={() => onDecide(entity.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  }
                  {decision === 'approved' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified
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
