import React from 'react';
import { CheckIcon, XIcon } from 'lucide-react';
import type { ReadinessSubmission, AssertionStatus } from '../../data/readinessSubmissions';
import type { Actor } from '../../data/actors';

interface ReadinessQueueProps {
  submissions: ReadinessSubmission[];
  actorsById: Map<string, Actor>;
  decisions: Record<string, AssertionStatus>;
  onDecide: (id: string, status: AssertionStatus) => void;
}

function scoreTone(score: number) {
  if (score >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-700' };
  if (score >= 55) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  return { bar: 'bg-rose-500', text: 'text-rose-700' };
}

export function ReadinessQueue({ submissions, actorsById, decisions, onDecide }: ReadinessQueueProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Readiness submissions</h2>
        <p className="text-[12.5px] text-gray-400">
          Self-assessed readiness with flagged evidence gaps — issue or withhold a Readiness Assertion.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {submissions.map((submission) => {
          const actor = actorsById.get(submission.actorId);
          const status = decisions[submission.id] ?? submission.assertionStatus;
          const tone = scoreTone(submission.selfScore);

          return (
            <li
              key={submission.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              status === 'issued' ?
              'border-emerald-200 bg-emerald-50/40' :
              status === 'withheld' ?
              'border-gray-100 bg-gray-50 opacity-70' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor?.name ?? 'Unknown exporter'}</p>
                    <span className="font-mono text-[10.5px] text-gray-400">{actor?.natepId}</span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">Submitted {submission.submittedOn}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`w-9 shrink-0 text-[13px] font-semibold ${tone.text}`}>{submission.selfScore}</span>
                    <span className="h-1.5 max-w-[160px] flex-1 overflow-hidden rounded-full bg-gray-100">
                      <span className={`block h-full rounded-full ${tone.bar}`} style={{ width: `${submission.selfScore}%` }} />
                    </span>
                  </div>

                  {submission.evidenceGaps.length > 0 ?
                  <div className="mt-2 flex flex-wrap gap-1.5">
                      {submission.evidenceGaps.map((gap) =>
                    <span key={gap} className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] text-amber-700">
                          {gap}
                        </span>
                    )}
                    </div> :

                  <p className="mt-2 text-[11.5px] text-emerald-600">No evidence gaps flagged</p>
                  }
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'pending' &&
                  <>
                      <button
                    type="button"
                    onClick={() => onDecide(submission.id, 'issued')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Issue assertion
                      </button>
                      <button
                    type="button"
                    onClick={() => onDecide(submission.id, 'withheld')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Withhold
                      </button>
                    </>
                  }
                  {status === 'issued' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Assertion issued
                    </span>
                  }
                  {status === 'withheld' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Withheld
                    </span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
