import React from 'react';
import { CheckIcon, EyeIcon, InfoIcon, ShieldOffIcon, XIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { BuyerTierBadge } from '../components/workspace/TierBadge';
import { buyers } from '../data/buyers';
import { buyerTiers } from '../data/buyerTiers';
import { opportunities } from '../data/opportunities';
import { consentGrants } from '../data/consentGrants';
import { useExporterSession } from '../lib/exporterSession';
import { useGatewayExchange, type IntroductionRequest } from '../lib/gatewayExchange';
import { modeLabel, sectorLabel } from '../lib/marketplaceLookups';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { Spinner } from '../components/common/Spinner';

/** What an accepted introduction discloses (FND-05/06): enough to decide on a conversation,
 * nothing more. */
const disclosedFields = ['Your name and NATEP ID', 'Your tier and what was verified', 'Your verified certifications'];

const responseLabels: Record<Exclude<IntroductionRequest['response'], 'pending' | 'accepted'>, string> = {
  declined: 'You declined',
  withdrawn: 'You withdrew consent'
};

export function WorkspaceIntroductions() {
  const { actor } = useExporterSession();
  const { introductions, respondToIntroduction } = useGatewayExchange();
  const { logEvent } = useAuditLog();

  const mine = introductions.filter((item) => item.actorId === actor.id);
  const pending = mine.filter((item) => item.response === 'pending');
  const active = mine.filter((item) => item.response === 'accepted');
  const closed = mine.filter((item) => item.response === 'declined' || item.response === 'withdrawn');
  const earlierGrants = consentGrants.filter((grant) => grant.actorId === actor.id);

  const { run, pending: inFlight, isPending } = usePendingAction();

  const respond = (introduction: IntroductionRequest, response: IntroductionRequest['response']) =>
  run(`${introduction.id}-${response}`, () => {
    const buyer = buyers.find((item) => item.id === introduction.buyerId);
    const opportunity = opportunities.find((item) => item.id === introduction.opportunityId);
    respondToIntroduction(introduction.id, response);
    const verb = response === 'accepted' ? 'shared their profile with' : response === 'declined' ? 'declined an introduction to' : 'withdrew consent from';
    logEvent(`${actor.name} ${verb} ${buyer?.name ?? 'a buyer'} for "${opportunity?.title ?? introduction.opportunityId}"`, 'consent', actor.name);
  });

  const busy = (introduction: IntroductionRequest, response: IntroductionRequest['response']) =>
  isPending(`${introduction.id}-${response}`);

  const renderCard = (introduction: IntroductionRequest) => {
    const buyer = buyers.find((item) => item.id === introduction.buyerId)!;
    const tier = buyerTiers.find((item) => item.id === buyer.tier)!;
    const opportunity = opportunities.find((item) => item.id === introduction.opportunityId)!;
    const mandatory = opportunity.criteria.filter((criterion) => criterion.kind === 'mandatory');

    return (
      <li key={introduction.id} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-900">{buyer.name}</h3>
            <p className="text-[12.5px] text-gray-600">
              {buyer.region} · {tier.verifies}
            </p>
          </div>
          <BuyerTierBadge tier={tier} />
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-gray-600">For their request</p>
          <p className="mt-1 text-[14.5px] font-semibold text-gray-900">{opportunity.title}</p>
          <p className="mt-0.5 text-[12.5px] text-gray-600">
            {sectorLabel(opportunity.sectorCode)} · {modeLabel(opportunity.mode)}
            {opportunity.indicativeValue &&
            ` · ${opportunity.indicativeValue.unit} ${opportunity.indicativeValue.min.toLocaleString()}–${opportunity.indicativeValue.max.toLocaleString()}`}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-gray-800">{opportunity.summary}</p>
          {mandatory.length > 0 &&
          <>
              <p className="mt-3 text-[12.5px] font-medium text-gray-700">Must-haves</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] text-gray-800">
                {mandatory.map((criterion) =>
              <li key={criterion.label}>{criterion.label}</li>
              )}
              </ul>
            </>
          }
        </div>

        {introduction.response === 'pending' &&
        <>
            <p className="mt-4 text-[13px] font-medium text-gray-800">If you accept, {buyer.name} will see:</p>
            <ul className="mt-1.5 space-y-1">
              {disclosedFields.map((field) =>
            <li key={field} className="flex items-start gap-2 text-[13px] text-gray-700">
                  <EyeIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                  {field}
                </li>
            )}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
              type="button"
              onClick={() => respond(introduction, 'accepted')}
              disabled={Boolean(inFlight)}
              aria-busy={busy(introduction, 'accepted') || undefined}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black disabled:cursor-progress disabled:bg-gray-800">

                {busy(introduction, 'accepted') ? <Spinner /> : <CheckIcon className="h-4 w-4" aria-hidden="true" />}
                {busy(introduction, 'accepted') ? 'Sharing your profile…' : 'Accept and share'}
              </button>
              <button
              type="button"
              onClick={() => respond(introduction, 'declined')}
              disabled={Boolean(inFlight)}
              aria-busy={busy(introduction, 'declined') || undefined}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-5 text-[13.5px] font-medium text-gray-800 hover:border-gray-500 disabled:cursor-progress">

                {busy(introduction, 'declined') ? <Spinner /> : <XIcon className="h-4 w-4" aria-hidden="true" />}
                {busy(introduction, 'declined') ? 'Declining…' : 'Decline'}
              </button>
            </div>
          </>
        }

        {introduction.response === 'accepted' &&
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-800">
              <CheckIcon className="h-4 w-4" aria-hidden="true" />
              Your profile is shared with {buyer.name}
            </p>
            <button
            type="button"
            onClick={() => respond(introduction, 'withdrawn')}
            disabled={Boolean(inFlight)}
            aria-busy={busy(introduction, 'withdrawn') || undefined}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-4 text-[13px] font-medium text-gray-800 hover:border-rose-400 hover:text-rose-800 disabled:cursor-progress">

              {busy(introduction, 'withdrawn') ? <Spinner /> : <ShieldOffIcon className="h-4 w-4" aria-hidden="true" />}
              {busy(introduction, 'withdrawn') ? 'Withdrawing…' : 'Withdraw consent'}
            </button>
          </div>
        }

        {(introduction.response === 'declined' || introduction.response === 'withdrawn') &&
        <p className="mt-4 text-[13px] text-gray-700">
            {responseLabels[introduction.response]} — {buyer.name} can't see your profile.
          </p>
        }
      </li>);

  };

  return (
    <WorkspaceLayout
      title="Introductions"
      intro="When you're on a shortlist, buyers see why you match but not who you are. They only see your profile if you accept — and you can withdraw that at any time.">

      <section aria-labelledby="intro-pending">
        <h2 id="intro-pending" className="text-[15px] font-semibold text-gray-900">
          Waiting for your answer <span className="font-normal tabular-nums text-gray-600">({pending.length})</span>
        </h2>
        {pending.length === 0 ?
        <p className="mt-2 rounded-2xl border border-gray-200 bg-white p-5 text-[13.5px] text-gray-600">
            No requests right now. When a buyer asks to see your profile after you're shortlisted, it appears here.
          </p> :

        <ul className="mt-3 space-y-4">{pending.map(renderCard)}</ul>
        }
      </section>

      {active.length > 0 &&
      <section aria-labelledby="intro-active" className="mt-8">
          <h2 id="intro-active" className="text-[15px] font-semibold text-gray-900">
            Shared with buyers
          </h2>
          <ul className="mt-3 space-y-4">{active.map(renderCard)}</ul>
        </section>
      }

      {closed.length > 0 &&
      <section aria-labelledby="intro-closed" className="mt-8">
          <h2 id="intro-closed" className="text-[15px] font-semibold text-gray-900">
            Not shared
          </h2>
          <ul className="mt-3 space-y-4">{closed.map(renderCard)}</ul>
        </section>
      }

      {earlierGrants.length > 0 &&
      <section aria-labelledby="intro-earlier" className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <h2 id="intro-earlier" className="text-[15px] font-semibold text-gray-900">
            Earlier consents
          </h2>
          <ul className="mt-3 divide-y divide-gray-100">
            {earlierGrants.map((grant) =>
          <li key={grant.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="text-[14px] text-gray-900">{grant.recipient}</p>
                  <p className="text-[12.5px] text-gray-600">
                    {grant.purpose} · shares {grant.fieldsDisclosed.join(', ').toLowerCase()}
                  </p>
                </div>
                <span
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
              grant.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-700'}`
              }>

                  {grant.status === 'active' ? 'Active' : grant.status === 'revoked' ? 'Withdrawn' : 'Expired'}
                </span>
              </li>
          )}
          </ul>
        </section>
      }

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Withdrawing consent ends the buyer's access straight away. Anything they already downloaded is covered by
        their terms of use, not by the Gateway.
      </p>
    </WorkspaceLayout>);

}
