import React, { useState } from 'react';
import { CheckCircle2Icon, InfoIcon, ShieldOffIcon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { opportunities } from '../data/opportunities';
import { consentGrants } from '../data/consentGrants';
import { actors } from '../data/actors';
import { outcomeReports } from '../data/outcomes';
import { engagementStageLabels, type EngagementStage } from '../lib/engagementStage';
import { useBuyerSession } from '../lib/buyerSession';
import { buyerEngagements } from '../lib/buyerWorkspace';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { Spinner } from '../components/common/Spinner';
import { useGatewayExchange } from '../lib/gatewayExchange';

const stageOrder: EngagementStage[] = [
'package-ready',
'referral-sent',
'buyer-reviewing',
'interview-scheduled',
'contract-signed',
'commenced'];


function ConfirmDelivery({ engagementId, title }: {engagementId: string;title: string;}) {
  const { buyer } = useBuyerSession();
  const { logEvent } = useAuditLog();
  const { deliveryConfirmations, confirmDelivery } = useGatewayExchange();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { run, isPending } = usePendingAction();

  const confirmed = deliveryConfirmations.find((item) => item.engagementId === engagementId);
  const seededReport = outcomeReports.find((report) => report.engagementId === engagementId && report.reportedBy === 'buyer');

  if (confirmed || seededReport) {
    const value = confirmed?.amount ?? seededReport!.amount;
    return (
      <p className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-[13px] leading-relaxed text-emerald-900">
        <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        You confirmed delivery worth USD {value.toLocaleString()}. It stays provisional until a NATEP verifier checks it
        against the invoice — then it counts toward the exporter's verified delivery history.
      </p>);

  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (!amount || Number(amount) <= 0) {
          setError('Enter the value delivered in US dollars.');
          return;
        }
        run('confirm', () => {
          confirmDelivery({ engagementId, amount: Number(amount), note });
          logEvent(
            `${buyer.name} confirmed delivery of "${title}" (USD ${Number(amount).toLocaleString()}, provisional)`,
            'outcomes',
            buyer.name
          );
        });
      }}
      className="mt-4 rounded-xl border border-gray-200 p-4">

      <p className="text-[13.5px] font-semibold text-gray-900">Confirm delivery</p>
      <p className="text-[12.5px] text-gray-600">When the work is complete, tell us what it was worth.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[160px_1fr]">
        <div>
          <label htmlFor={`amount-${engagementId}`} className="block text-[12.5px] font-medium text-gray-800">
            Value (USD)
          </label>
          <input
            id={`amount-${engagementId}`}
            type="number"
            inputMode="numeric"
            min={0}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError('');
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `amount-error-${engagementId}` : undefined}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[14px] focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15 aria-[invalid=true]:border-rose-600" />

        </div>
        <div>
          <label htmlFor={`note-${engagementId}`} className="block text-[12.5px] font-medium text-gray-800">
            What was delivered <span className="font-normal text-gray-600">(optional)</span>
          </label>
          <input
            id={`note-${engagementId}`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-[14px] focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/15" />

        </div>
      </div>
      {error &&
      <p id={`amount-error-${engagementId}`} className="mt-1 text-[12.5px] text-rose-700">
          {error}
        </p>
      }
      <button
        type="submit"
        disabled={isPending('confirm')}
        aria-busy={isPending('confirm') || undefined}
        className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black disabled:cursor-progress disabled:bg-gray-800">

        {isPending('confirm') && <Spinner />}
        {isPending('confirm') ? 'Recording delivery…' : 'Confirm delivery'}
      </button>
    </form>);

}

export function BuyerEngagements() {
  const { buyer } = useBuyerSession();
  const engagements = buyerEngagements(buyer);

  return (
    <BuyerLayout
      title="Engagements"
      intro="Exporters you've been introduced to, and where each engagement stands. Access to an exporter's profile lasts only as long as their consent.">

      {engagements.length === 0 &&
      <p className="rounded-2xl border border-gray-200 bg-white p-5 text-[13.5px] text-gray-600">
          No engagements yet. They start when a shortlisted exporter agrees to share their profile with you.
        </p>
      }

      <ul className="space-y-4">
        {engagements.map((engagement) => {
          const opportunity = opportunities.find((item) => item.id === engagement.opportunityId)!;
          const grant = consentGrants.find((item) => item.id === engagement.consentGrantId);
          const actor = grant ? actors.find((item) => item.id === grant.actorId) : undefined;
          const accessActive = grant?.status === 'active';
          const stageIndex = stageOrder.indexOf(engagement.stage);

          return (
            <li key={engagement.id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
              <h2 className="text-[16px] font-semibold text-gray-900">{opportunity.title}</h2>
              <p className="mt-0.5 text-[13px] text-gray-700">
                {accessActive && actor ? `With ${actor.name}` : 'Exporter profile no longer shared'}
              </p>

              {!accessActive &&
              <p className="mt-3 flex gap-2 rounded-xl bg-gray-100 p-3 text-[12.5px] leading-relaxed text-gray-800">
                  <ShieldOffIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {grant?.status === 'revoked' ?
                'The exporter withdrew consent, so their profile and documents are no longer available to you.' :
                'The consent for this introduction expired, so the exporter’s profile is no longer available to you.'}
                </p>
              }

              <p className="mt-4 text-[12.5px] text-gray-700">
                Stage: <span className="font-semibold text-gray-900">{engagementStageLabels[engagement.stage]}</span>
              </p>
              <ol className="mt-1.5 flex gap-1" aria-label="Engagement progress">
                {stageOrder.map((stage, index) =>
                <li key={stage} className="flex-1">
                    <span
                    className={`block h-1.5 rounded-full ${index <= stageIndex ? 'bg-gray-900' : 'bg-gray-200'}`}
                    aria-hidden="true" />

                    <span className="sr-only">
                      {engagementStageLabels[stage]}
                      {index <= stageIndex ? ' (done)' : ''}
                    </span>
                  </li>
                )}
              </ol>

              {engagement.stage === 'commenced' && accessActive &&
              <ConfirmDelivery engagementId={engagement.id} title={opportunity.title} />
              }
            </li>);

        })}
      </ul>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Contracts are signed between you and the exporter outside the Gateway. Escrow-backed milestones are not in this
        prototype yet.
      </p>
    </BuyerLayout>);

}
