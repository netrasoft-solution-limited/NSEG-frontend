import React from 'react';
import { CheckIcon, ShieldAlertIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import { incentiveTypeLabels, type IncentiveApplication } from '../../data/incentives';
import { auditFailureLabels, auditIncentiveApplication } from '../../lib/incentiveAudit';

interface IncentiveAuditLedgerProps {
  applications: IncentiveApplication[];
  actorsById: Map<string, Actor>;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const conditionRows: {
  key: 'activeStanding' | 'sufficientTradeVolume' | 'noComplianceFlags';
  label: string;
}[] = [
{ key: 'activeStanding', label: 'Active standing' },
{ key: 'sufficientTradeVolume', label: 'Trade volume' },
{ key: 'noComplianceFlags', label: 'No compliance flags' }];


export function IncentiveAuditLedger({ applications, actorsById }: IncentiveAuditLedgerProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Incentive audit & anti-leakage</h2>
        <p className="text-[12.5px] text-gray-400">
          Every grant application clears three independent conditions before an Audit Verification
          Token is issued — this runs regardless of what the Incentives queue's own pre-qualification
          flag says, to catch what a single-threshold check misses.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {applications.map((application) => {
          const actor = actorsById.get(application.actorId);
          const result = auditIncentiveApplication(application, actor);

          return (
            <li
              key={application.id}
              className={`rounded-xl border px-4 py-3 ${
              result.passed ? 'border-gray-100 bg-white' : 'border-rose-200 bg-rose-50/40'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor?.name ?? application.actorId}</p>
                    <span className="font-mono text-[10.5px] text-gray-400">{actor?.natepId}</span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {incentiveTypeLabels[application.type]} · Requesting{' '}
                    {currency.format(application.requestedAmount)} against{' '}
                    {currency.format(application.verifiedExportVolume)} verified volume
                  </p>

                  <div className="mt-2 flex flex-wrap gap-3">
                    {conditionRows.map((row) => {
                      const met = result[row.key];
                      return (
                        <span
                          key={row.key}
                          className={`inline-flex items-center gap-1 text-[11.5px] font-medium ${
                          met ? 'text-emerald-700' : 'text-rose-600'}`
                          }>

                          {met ? <CheckIcon className="h-3 w-3" aria-hidden="true" /> : <XIcon className="h-3 w-3" aria-hidden="true" />}
                          {row.label}
                        </span>);

                    })}
                  </div>

                  {!result.passed &&
                  <ul className="mt-1.5 space-y-0.5">
                      {result.failureCodes.map((code) =>
                    <li key={code} className="flex items-center gap-1 text-[11px] text-rose-500">
                          <ShieldAlertIcon className="h-3 w-3" aria-hidden="true" />
                          <span className="font-mono">{code}</span> — {auditFailureLabels[code]}
                        </li>
                    )}
                    </ul>
                  }
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                  {result.passed ?
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      AVT issued
                    </span> :

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-[12px] font-semibold text-rose-700">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Rejected
                    </span>
                  }
                  {result.avt &&
                  <span className="font-mono text-[10px] text-gray-400">{result.avt}</span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
