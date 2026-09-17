import React from 'react';
import { Link } from 'react-router-dom';
import { InfoIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { EmptyState, KeyValue, Tag } from '../components/workspace/WorkspaceUI';
import { useExporterSession } from '../lib/exporterSession';
import { engagementsFor } from '../lib/exporterDisclosures';
import { engagementStageLabels, type EngagementStage } from '../lib/engagementStage';
import { modeLabel } from '../lib/marketplaceLookups';

const stageTone = (stage: EngagementStage) =>
stage === 'commenced' || stage === 'contract-signed' ? 'ok' : stage === 'declined' ? 'clay' : 'gold';

const stageNote: Partial<Record<EngagementStage, string>> = {
  'package-ready': 'Your consented profile is ready to send to the buyer.',
  'referral-sent': 'The buyer has your introduction and has not opened it yet.',
  'buyer-reviewing': 'The buyer is reviewing your introduction. An offer, if made, appears here.',
  'interview-scheduled': 'The buyer wants to talk before making an offer.',
  'contract-signed': 'You and the buyer signed. Delivery has not started yet.',
  commenced: 'Delivery is under way. The buyer confirms completion, then an officer verifies it.'
};

export function ExporterContracts() {
  const { actor } = useExporterSession();
  const contracts = engagementsFor(actor);

  return (
    <WorkspaceLayout
      title="Contract offers"
      intro="Engagements that came from introductions you consented to, and where each one stands. The Gateway records the stage; it never holds or moves money.">

      {contracts.length === 0 ?
      <EmptyState
        title="No offers yet"
        action={
        <Link to="/workspace/consent" className="inline-flex min-h-[44px] items-center rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">
              Check consent requests
            </Link>
        }>

          A buyer who reviews your consented introduction can make you an offer. It will appear here.
        </EmptyState> :

      <ul className="space-y-4">
          {contracts.map(({ engagement, grant, opportunity, buyer }) =>
        <li key={engagement.id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[18px] font-semibold text-gray-900">{opportunity.title}</h2>
                  <p className="mt-0.5 text-[13px] text-gray-600">
                    {buyer?.name ?? 'Buyer'}, {opportunity.buyerRegion} · <span className="font-mono">{engagement.id.toUpperCase()}</span>
                  </p>
                </div>
                <Tag tone={stageTone(engagement.stage)}>{engagementStageLabels[engagement.stage]}</Tag>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-3 border-y border-gray-100 py-4 sm:grid-cols-2 lg:grid-cols-4">
                <KeyValue label="Indicative value">
                  {opportunity.indicativeValue ?
              `${opportunity.indicativeValue.unit} ${opportunity.indicativeValue.min.toLocaleString()}–${opportunity.indicativeValue.max.toLocaleString()}` :
              'Not stated'}
                </KeyValue>
                <KeyValue label="Delivery">{modeLabel(opportunity.mode)}</KeyValue>
                <KeyValue label="Posted">{opportunity.postedOn}</KeyValue>
                <KeyValue label="Shared under consent">{grant.grantedOn}</KeyValue>
              </dl>
              {stageNote[engagement.stage] && <p className="mt-3 text-[13.5px] leading-relaxed text-gray-700">{stageNote[engagement.stage]}</p>}
            </li>
        )}
        </ul>
      }

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Contracts are signed between you and the buyer, outside the Gateway. The Gateway records the stage so outcomes can be
        verified and counted.
      </p>
    </WorkspaceLayout>);

}
