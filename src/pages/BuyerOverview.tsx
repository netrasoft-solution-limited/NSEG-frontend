import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckIcon, CircleIcon, CirclePlusIcon, HourglassIcon, InfoIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { BuyerTierBadge } from '../components/workspace/TierBadge';
import { buyerTiers } from '../data/buyerTiers';
import { useBuyerSession } from '../lib/buyerSession';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { registryTypeLabels, useAccounts, type RegistryType } from '../lib/accounts';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { Field, PrimaryButton, inputClass } from '../components/workspace/FormField';
import { Callout, Panel, Stat, StatGrid, Tag, Timeline, primaryLinkClass, type TimelineState } from '../components/workspace/WorkspaceUI';
import { sectorLabel } from '../lib/marketplaceLookups';
import {
  buyerEngagements,
  buyerOpportunities,
  buyerShortlist,
  buyerStanding,
  engagedCandidateId,
  requestStatusFor,
  requestStatusSteps,
  type RequestStatus } from
'../lib/buyerWorkspace';

/** How far each request status has moved through the handling stages shown on the overview. */
const stagesDone: Record<RequestStatus, number> = {
  draft: 0,
  'awaiting-qualification': 1,
  published: 3,
  shortlisting: 4,
  engaging: 5,
  'in-delivery': 5
};

const handlingStages = [
{ title: 'Submitted', detail: 'You state the requirement in structured form' },
{ title: 'Qualified', detail: 'A desk officer checks credibility and records a reason' },
{ title: 'Requirements attached', detail: 'The exact version of every applicable rule is pinned' },
{ title: 'Matched', detail: 'Evidenced capability compared; the reasoning is shown in full' },
{ title: 'Consent', detail: 'Exporters choose whether to share their details with you' },
{ title: 'Contract and outcome', detail: 'You engage; delivery is confirmed and verified' }];


function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** What an officer actually checks to grant each tier — shown on the ladder. */
const tierChecks: Record<string, string[]> = {
  registered: ['Business email confirmed'],
  'registry-verified': ['Company found in its home-country business registry', 'Tax or company number matches'],
  'payment-verified': ['Payment instrument verified with the settlement partner']
};

export function BuyerOverview() {
  const { buyer, state } = useBuyerSession();
  const exchange = useGatewayExchange();
  const accounts = useAccounts();
  const { logEvent } = useAuditLog();
  const [searchParams] = useSearchParams();
  const canStartVerification = buyer.tier === 'registered' && buyer.verificationQueue === 'none';
  const [verifyOpen, setVerifyOpen] = useState(searchParams.get('verify') === '1');
  const [registry, setRegistry] = useState<RegistryType>('lei');
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const isNew = accounts.isNewAccount(buyer.id);
  const { run, isPending } = usePendingAction();
  const standing = buyerStanding(buyer);
  const tierIndex = buyerTiers.indexOf(standing.tier);

  const requests = buyerOpportunities(buyer);
  const shortlistsReady = requests.filter((opportunity) => buyerShortlist(opportunity)).length;
  const shortlistsToReview = requests.filter(
    (opportunity) => buyerShortlist(opportunity) && !state.selections[opportunity.id] && !engagedCandidateId(opportunity)
  ).length;
  const engagements = buyerEngagements(buyer);
  const unconfirmed = engagements.filter(
    (engagement) =>
    engagement.stage === 'commenced' &&
    !exchange.deliveryConfirmations.some((item) => item.engagementId === engagement.id)
  );
  const drafts = state.drafts;
  const submitted = exchange.requests.filter((request) => request.buyerId === buyer.id);

  const statuses: RequestStatus[] = [
  ...requests.map(requestStatusFor),
  ...submitted.map((request) => request.decision === 'pending' ? 'awaiting-qualification' as const : 'published' as const)];

  const furthest = statuses.length ? Math.max(...statuses.map((status) => stagesDone[status])) : 0;
  const inProgress = statuses.filter((status) => status !== 'in-delivery').length;
  const recent = [
  ...submitted.map((request) => ({
    id: request.id,
    title: request.title,
    detail: `${sectorLabel(request.sectorCode)} · USD ${request.budgetMin.toLocaleString()}–${request.budgetMax.toLocaleString()}`,
    tag: request.decision === 'pending' ?
    <Tag tone="gold">Awaiting qualification</Tag> :
    request.decision === 'rejected' ?
    <Tag tone="clay">Not qualified</Tag> :
    <Tag tone="green">Qualified</Tag>
  })),
  ...requests.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    detail: `${sectorLabel(opportunity.sectorCode)} · posted ${opportunity.postedOn}`,
    tag:
    <Tag tone={requestStatusFor(opportunity) === 'in-delivery' ? 'ok' : 'green'}>
          {requestStatusSteps.find((step) => step.id === requestStatusFor(opportunity))?.label}
        </Tag>

  }))].
  slice(0, 4);

  return (
    <BuyerLayout
      section="Overview"
      title={`${greeting()}, ${buyer.contactName?.split(' ')[0] ?? buyer.name}`}
      intro={`${buyer.name} · ${standing.tier.badge} buyer · ${buyer.region}`}
      actions={
      <Link to="/buyer/requests/new" className={primaryLinkClass}>
          <CirclePlusIcon className="h-4 w-4" aria-hidden="true" />
          Place a requirement
        </Link>
      }>

      <div className="space-y-4">
        {isNew && requests.length === 0 && drafts.length === 0 && submitted.length === 0 &&
        <Callout tone="green" title="Place your first requirement" action={{ label: 'Get started', to: '/buyer/requests/new' }}>
            Your account is ready ({buyer.referenceId}). You'll only be asked to verify your company when you send a
            requirement for qualification.
          </Callout>
        }
        {shortlistsToReview > 0 &&
        <Callout
          tone="green"
          title={`You have ${shortlistsToReview} officer-approved ${shortlistsToReview === 1 ? 'shortlist' : 'shortlists'} to review`}
          action={{ label: 'Review now', to: '/buyer/introductions' }}>

            See why each exporter matches. You see who they are once they agree to share their details.
          </Callout>
        }
        {unconfirmed.length > 0 &&
        <Callout
          tone="gold"
          title={`${unconfirmed.length} ${unconfirmed.length === 1 ? 'contract is' : 'contracts are'} in delivery`}
          action={{ label: 'Confirm delivery', to: '/buyer/contracts' }}>

            Confirm when the work is complete. An officer then verifies the outcome.
          </Callout>
        }
        {drafts.length > 0 &&
        <Callout
          tone="neutral"
          title={`${drafts.length} draft ${drafts.length === 1 ? 'requirement has' : 'requirements have'} not been submitted`}
          action={{ label: 'Finish', to: '/buyer/requests' }} />

        }
      </div>

      <div className="mt-6">
        <StatGrid>
          <Stat label="Requirements placed" value={statuses.length} detail={drafts.length ? `Plus ${drafts.length} in draft` : 'Sent for qualification'} />
          <Stat label="In progress" value={inProgress} detail="Being qualified or matched" />
          <Stat label="Shortlists waiting" value={shortlistsToReview} detail={shortlistsToReview ? 'Action needed from you' : 'Nothing waiting'} />
          <Stat label="Contracts" value={engagements.length} detail={`${shortlistsReady} ${shortlistsReady === 1 ? 'shortlist' : 'shortlists'} issued so far`} />
        </StatGrid>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Your requirements"
          aside={
          <Link to="/buyer/requests" className="text-[13px] font-semibold text-gray-900 underline-offset-4 hover:underline">
              See all
            </Link>
          }>

          {recent.length === 0 ?
          <p className="text-[13.5px] text-gray-600">No requirements placed yet.</p> :

          <ul className="divide-y divide-gray-100">
              {recent.map((item) =>
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900">{item.title}</p>
                    <p className="text-[12.5px] text-gray-600">{item.detail}</p>
                  </div>
                  {item.tag}
                </li>
            )}
            </ul>
          }
        </Panel>

        <Panel title="How your requirement is handled" intro="Every stage is recorded and can be challenged.">
          <Timeline
            steps={handlingStages.map((stage, index) => ({
              ...stage,
              state: (index < furthest ? 'done' : index === furthest ? 'now' : 'later') as TimelineState
            }))} />

        </Panel>
      </div>

      <div className="mt-6">

      <section aria-labelledby="buyer-tier" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="buyer-tier" className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray-600">
          Your verification
        </h2>
        <div className="mt-2">
          <BuyerTierBadge tier={standing.tier} size="lg" />
        </div>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-gray-700">{standing.tier.verifies}.</p>

        <div className="mt-5 rounded-xl bg-gray-900 p-4 text-white">
          <p className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-gray-300">
            {standing.checkInProgress && <HourglassIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            {standing.next ? standing.checkInProgress ? 'Check in progress' : 'Your next step' : 'Holding your tier'}
          </p>
          <p className="mt-1.5 text-[15px] leading-snug">{standing.nextAction}</p>
          {canStartVerification && !verifyOpen &&
          <button
            type="button"
            onClick={() => setVerifyOpen(true)}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-[13px] font-semibold text-gray-900 hover:bg-gray-100">

              Verify your company
            </button>
          }
        </div>

        {buyer.verificationQueue === 'none' && buyer.verificationNote &&
        <p className="mt-3 rounded-xl bg-rose-50 p-3 text-[13px] leading-relaxed text-rose-900">{buyer.verificationNote}</p>
        }

        {canStartVerification && verifyOpen &&
        <form
          id="verify"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (identifier.trim().length < 5) {
              setIdentifierError('Enter the identifier exactly as it appears in the registry.');
              return;
            }
            run('verify', () => {
              if (isNew) accounts.requestBuyerVerification(buyer.id, registry, identifier.trim());
              logEvent(`${buyer.name} submitted ${registryTypeLabels[registry]} for company verification`, 'buyers', buyer.contactName ?? buyer.name);
              setVerifyOpen(false);
            });
          }}
          className="mt-4 space-y-4 rounded-xl border border-gray-200 p-4">

            <p className="text-[13.5px] text-gray-700">
              We check open registries first (GLEIF, Companies House, VIES). If there's no automatic match, a desk officer
              reviews it. You can keep using your account while that happens.
            </p>
            <Field id="verify-registry" label="Registry">
              {(d) =>
            <select id="verify-registry" value={registry} onChange={(e) => setRegistry(e.target.value as RegistryType)} aria-describedby={d} className={inputClass}>
                  {(Object.keys(registryTypeLabels) as RegistryType[]).map((key) =>
              <option key={key} value={key}>{registryTypeLabels[key]}</option>
              )}
                </select>
            }
            </Field>
            <Field id="verify-identifier" label="Identifier" error={identifierError}>
              {(d) =>
            <input
              id="verify-identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setIdentifierError('');
              }}
              aria-invalid={Boolean(identifierError)}
              aria-describedby={d}
              className={inputClass} />

            }
            </Field>
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit" loading={isPending('verify')} loadingLabel="Checking registries…">Submit for verification</PrimaryButton>
              <button type="button" onClick={() => setVerifyOpen(false)} className="min-h-[44px] rounded-full px-4 text-[13.5px] font-medium text-gray-700 hover:text-gray-900">
                Not now
              </button>
            </div>
          </form>
        }
      </section>

      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="buyer-unlocked" className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 id="buyer-unlocked" className="text-[15px] font-semibold text-gray-900">
            What you can do now
          </h2>
          <ul className="mt-3 space-y-2">
            {buyerTiers.slice(0, tierIndex + 1).flatMap((tier) => tier.unlocked).map((item) =>
            <li key={item} className="flex items-start gap-2 text-[13.5px] text-gray-800">
                <UnlockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {item}
              </li>
            )}
          </ul>
        </section>
        <section aria-labelledby="buyer-next" className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 id="buyer-next" className="text-[15px] font-semibold text-gray-900">
            {standing.next ? `${standing.next.badge} adds` : 'Everything is unlocked'}
          </h2>
          {standing.next ?
          <ul className="mt-3 space-y-2">
              {standing.next.unlocked.map((item) =>
            <li key={item} className="flex items-start gap-2 text-[13.5px] text-gray-600">
                  <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                  {item}
                </li>
            )}
            </ul> :

          <p className="mt-3 text-[13.5px] leading-relaxed text-gray-600">{standing.tier.nextStep}</p>
          }
        </section>
      </div>

      <section aria-labelledby="buyer-ladder" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="buyer-ladder" className="text-[15px] font-semibold text-gray-900">
          How buyer verification works
        </h2>
        <ol className="mt-4 space-y-3">
          {buyerTiers.map((tier, index) => {
            const reached = index <= tierIndex;
            return (
              <li
                key={tier.id}
                aria-current={index === tierIndex ? 'step' : undefined}
                className={`rounded-xl border p-4 ${index === tierIndex ? 'border-gray-900' : 'border-gray-200'}`}>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <BuyerTierBadge tier={tier} />
                  <span className="text-[12px] font-medium text-gray-600">
                    {index === tierIndex ? 'You are here' : reached ? 'Reached' : index === tierIndex + 1 ? 'Next' : 'Later'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {tierChecks[tier.id].map((check) =>
                  <li key={check} className="flex items-start gap-2 text-[13px]">
                      {reached ?
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /> :

                    <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    }
                      <span className={reached ? 'text-gray-800' : 'text-gray-600'}>
                        {check}
                        <span className="sr-only">{reached ? ' (done)' : ' (not yet)'}</span>
                      </span>
                    </li>
                  )}
                </ul>
              </li>);

          })}
        </ol>
      </section>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        NATEP qualifies requests and approves shortlists, but the decision to engage an exporter is always yours.
        Contracts are signed between you and the exporter, outside the Gateway.
      </p>
    </BuyerLayout>);

}
