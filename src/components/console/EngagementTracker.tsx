import React from 'react';
import { AlertTriangleIcon, ArrowRightIcon, FileCheckIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import type { ConsentGrant, ConsentStatus } from '../../data/consentGrants';
import type { Engagement } from '../../data/engagements';
import type { Opportunity } from '../../data/opportunities';
import type { VaultDocument } from '../../data/vaultDocuments';
import { buildDisclosurePackage } from '../../lib/disclosurePackage';
import { engagementStageLabels, isTerminalStage, nextStage, type EngagementStage } from '../../lib/engagementStage';
import { DisclosurePackageViewer } from './DisclosurePackageViewer';

interface EngagementTrackerProps {
  engagements: Engagement[];
  opportunitiesById: Map<string, Opportunity>;
  consentGrantsById: Map<string, ConsentGrant>;
  actorsById: Map<string, Actor>;
  vaultDocuments: VaultDocument[];
  stages: Record<string, EngagementStage>;
  onAdvance: (id: string) => void;
  onDecline: (id: string) => void;
  onViewPackage: (engagementId: string) => void;
}

const consentStyles: Record<ConsentStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  revoked: 'bg-rose-50 text-rose-700',
  expired: 'bg-gray-100 text-gray-500'
};

const stageStyles: Record<EngagementStage, string> = {
  'package-ready': 'bg-gray-100 text-gray-600',
  'referral-sent': 'bg-sky-50 text-sky-700',
  'buyer-reviewing': 'bg-amber-50 text-amber-700',
  'interview-scheduled': 'bg-violet-50 text-violet-700',
  'contract-signed': 'bg-emerald-50 text-emerald-700',
  commenced: 'bg-gate/10 text-gray-900',
  declined: 'bg-gray-100 text-gray-500'
};

export function EngagementTracker({
  engagements,
  opportunitiesById,
  consentGrantsById,
  actorsById,
  vaultDocuments,
  stages,
  onAdvance,
  onDecline,
  onViewPackage
}: EngagementTrackerProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Consented referrals</h2>
        <p className="text-[12.5px] text-gray-400">
          A referral's disclosure package is only as valid as the consent grant behind it — revoke or expire the
          grant and access must be cut regardless of stage.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {engagements.map((engagement) => {
          const opportunity = opportunitiesById.get(engagement.opportunityId);
          const consent = consentGrantsById.get(engagement.consentGrantId);
          const actor = consent ? actorsById.get(consent.actorId) : undefined;
          const stage = stages[engagement.id] ?? engagement.stage;
          const consentActive = consent?.status === 'active';
          const needsInvalidation = !consentActive && !isTerminalStage(stage);
          const upcoming = nextStage(stage);
          const verifiedDocs = actor ?
          vaultDocuments.filter((doc) => doc.actorId === actor.id && doc.verification === 'verified').length :
          0;

          return (
            <li
              key={engagement.id}
              className={`rounded-xl border px-4 py-3 ${
              needsInvalidation ? 'border-rose-200 bg-rose-50/40' : 'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{opportunity?.title ?? engagement.opportunityId}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${stageStyles[stage]}`}>

                      {engagementStageLabels[stage]}
                    </span>
                    {consent &&
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${consentStyles[consent.status]}`}>

                        Consent {consent.status}
                      </span>
                    }
                  </div>
                  <p className="mt-1 text-[13px] text-gray-700">
                    {actor?.name ?? 'Unknown exporter'} <span className="text-gray-400">→</span>{' '}
                    {consent?.recipient ?? 'Unknown buyer'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {consent?.fieldsDisclosed.map((field) =>
                    <span key={field} className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] text-gray-500">
                        {field}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-gray-400">
                    <FileCheckIcon className="h-3 w-3" aria-hidden="true" />
                    {verifiedDocs} verified vault document{verifiedDocs === 1 ? '' : 's'} included in this package
                  </p>
                  {needsInvalidation &&
                  <p className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-rose-600">
                      <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      Consent is {consent?.status} — disclosure access must be invalidated, not advanced.
                    </p>
                  }
                  {consent &&
                  <DisclosurePackageViewer
                    package={buildDisclosurePackage(consent, actor, vaultDocuments)}
                    onView={() => onViewPackage(engagement.id)} />

                  }
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {needsInvalidation &&
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 px-3 py-1.5 text-[12px] font-medium text-rose-700">
                      <AlertTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Needs invalidation
                    </span>
                  }
                  {!needsInvalidation && upcoming &&
                  <>
                      <button
                      type="button"
                      onClick={() => onAdvance(engagement.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Advance to {engagementStageLabels[upcoming]}
                      </button>
                      <button
                      type="button"
                      onClick={() => onDecline(engagement.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Declined
                      </button>
                    </>
                  }
                  {!needsInvalidation && !upcoming && stage === 'commenced' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      Commenced
                    </span>
                  }
                  {stage === 'declined' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      Declined by buyer
                    </span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
