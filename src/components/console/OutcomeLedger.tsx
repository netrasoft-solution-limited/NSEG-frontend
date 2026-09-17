import React from 'react';
import { AlertTriangleIcon, CheckIcon, UserCheckIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import type { ConsentGrant } from '../../data/consentGrants';
import type { Engagement } from '../../data/engagements';
import type { Opportunity } from '../../data/opportunities';
import type { OutcomeReport, OutcomeVerificationStatus } from '../../data/outcomes';
import {
  groupReportsByEngagement,
  hasCompetingProvisionalSibling,
  hasConfirmedSibling } from
'../../lib/outcomeVerification';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface OutcomeLedgerProps {
  reports: OutcomeReport[];
  engagementsById: Map<string, Engagement>;
  opportunitiesById: Map<string, Opportunity>;
  consentGrantsById: Map<string, ConsentGrant>;
  actorsById: Map<string, Actor>;
  decisions: Record<string, OutcomeVerificationStatus>;
  onDecide: (id: string, status: OutcomeVerificationStatus) => void;
  canMutate: boolean;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const reporterLabel: Record<OutcomeReport['reportedBy'], string> = {
  exporter: 'Exporter self-report',
  buyer: 'Buyer self-report'
};

export function OutcomeLedger({
  reports,
  engagementsById,
  opportunitiesById,
  consentGrantsById,
  actorsById,
  decisions,
  onDecide,
  canMutate
}: OutcomeLedgerProps) {
  const grouped = groupReportsByEngagement(reports);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Outcome reports</h2>
        <p className="text-[12.5px] text-gray-400">
          Self-reported revenue is Provisional and excluded from the Observatory until an Authorised
          Verifier independently confirms it — one export value, counted once.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {reports.map((report) => {
          const status = decisions[report.id] ?? report.verification;
          const engagement = engagementsById.get(report.engagementId);
          const opportunity = engagement ? opportunitiesById.get(engagement.opportunityId) : undefined;
          const consent = engagement ? consentGrantsById.get(engagement.consentGrantId) : undefined;
          const actor = consent ? actorsById.get(consent.actorId) : undefined;
          const group = (grouped.get(report.engagementId) ?? []).map((item) => ({
            ...item,
            verification: decisions[item.id] ?? item.verification
          }));
          const liveReport = { ...report, verification: status };
          const supersededByConfirmedSibling = status === 'provisional' && hasConfirmedSibling(liveReport, group);
          const hasCompetingReport = status === 'provisional' && hasCompetingProvisionalSibling(liveReport, group);

          return (
            <li
              key={report.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              status === 'verified' ?
              'border-emerald-200 bg-emerald-50/40' :
              status === 'rejected' ?
              'border-gray-100 bg-gray-50 opacity-70' :
              supersededByConfirmedSibling ?
              'border-amber-200 bg-amber-50/40' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{opportunity?.title ?? report.engagementId}</p>
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] font-medium text-gray-500">
                      {reporterLabel[report.reportedBy]}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {actor?.name ?? 'Unknown exporter'} <span className="text-gray-300">→</span>{' '}
                    {consent?.recipient ?? 'Unknown buyer'} · Reported {report.reportedOn}
                  </p>
                  <p className="mt-1 text-[13px] text-gray-600">
                    Reports <span className="font-semibold text-gray-900">{currency.format(report.amount)}</span> in
                    completed export value.
                  </p>
                  <p className="mt-1 text-[12.5px] text-gray-500">{report.evidenceSummary}</p>
                  {report.verificationNote &&
                  <p className="mt-1 text-[12px] text-gray-400">{report.verificationNote}</p>
                  }
                  {supersededByConfirmedSibling &&
                  <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-amber-700">
                      <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      The same export value was already verified from the other party's report — reject this one
                      to avoid double-counting.
                    </p>
                  }
                  {hasCompetingReport && !supersededByConfirmedSibling &&
                  <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-amber-700">
                      <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      The other party also self-reported this engagement — verify one and reject the other, not
                      both.
                    </p>
                  }
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'provisional' && !canMutate && <AuditOnlyBadge />}
                  {status === 'provisional' && canMutate &&
                  <>
                      <button
                      type="button"
                      onClick={() => onDecide(report.id, 'verified')}
                      disabled={supersededByConfirmedSibling}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-900">

                        <UserCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Verify
                      </button>
                      <button
                      type="button"
                      onClick={() => onDecide(report.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {supersededByConfirmedSibling ? 'Reject as duplicate' : 'Reject'}
                      </button>
                    </>
                  }
                  {status === 'verified' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified
                    </span>
                  }
                  {status === 'rejected' &&
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
