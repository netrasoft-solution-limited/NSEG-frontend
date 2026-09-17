import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, CircleIcon, HourglassIcon, InfoIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { BuyerTierBadge } from '../components/workspace/TierBadge';
import { buyerTiers } from '../data/buyerTiers';
import { useBuyerSession } from '../lib/buyerSession';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { registryTypeLabels, useAccounts, type RegistryType } from '../lib/accounts';
import { useAuditLog } from '../lib/auditLog';
import { Field, PrimaryButton, inputClass } from '../components/workspace/FormField';
import {
  buyerEngagements,
  buyerOpportunities,
  buyerShortlist,
  buyerStanding,
  engagedCandidateId,
  requestStatusFor } from
'../lib/buyerWorkspace';

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
  const standing = buyerStanding(buyer);
  const tierIndex = buyerTiers.indexOf(standing.tier);

  const requests = buyerOpportunities(buyer);
  const shortlistsReady = requests.filter((opportunity) => buyerShortlist(opportunity)).length;
  const shortlistsToReview = requests.filter(
    (opportunity) => buyerShortlist(opportunity) && !state.selections[opportunity.id] && !engagedCandidateId(opportunity)
  ).length;
  const engagements = buyerEngagements(buyer);
  const inDelivery = requests.filter((opportunity) => requestStatusFor(opportunity) === 'in-delivery');
  const unconfirmed = engagements.filter(
    (engagement) =>
    engagement.stage === 'commenced' &&
    !exchange.deliveryConfirmations.some((item) => item.engagementId === engagement.id)
  );
  const drafts = state.drafts;
  const submitted = exchange.requests.filter((request) => request.buyerId === buyer.id);

  const attention: { text: string; to: string; action: string }[] = [
  ...(shortlistsToReview > 0 ?
  [{ text: `${shortlistsToReview} officer-approved ${shortlistsToReview === 1 ? 'shortlist is' : 'shortlists are'} waiting for your decision`, to: '/buyer/shortlists', action: 'Review' }] :
  []),
  ...(unconfirmed.length > 0 ?
  [{ text: `${unconfirmed.length} ${unconfirmed.length === 1 ? 'engagement is' : 'engagements are'} in delivery — confirm when work is complete`, to: '/buyer/engagements', action: 'Open' }] :
  []),
  ...(drafts.length > 0 ?
  [{ text: `${drafts.length} draft ${drafts.length === 1 ? 'request has' : 'requests have'} not been submitted`, to: '/buyer/requests', action: 'Finish' }] :
  [])];


  const stats = [
  { label: 'Requests', value: requests.length + drafts.length + submitted.length },
  { label: 'Shortlists ready', value: shortlistsReady },
  { label: 'In delivery', value: inDelivery.length }];


  return (
    <BuyerLayout
      title="Overview"
      intro="Source Nigerian service exporters through officer-qualified requests. You're only asked to verify at the moment an action needs it.">

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
            if (isNew) accounts.requestBuyerVerification(buyer.id, registry, identifier.trim());
            logEvent(`${buyer.name} submitted ${registryTypeLabels[registry]} for company verification`, 'buyers', buyer.contactName ?? buyer.name);
            setVerifyOpen(false);
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
              <PrimaryButton type="submit">Submit for verification</PrimaryButton>
              <button type="button" onClick={() => setVerifyOpen(false)} className="min-h-[44px] rounded-full px-4 text-[13.5px] font-medium text-gray-700 hover:text-gray-900">
                Not now
              </button>
            </div>
          </form>
        }
      </section>

      {isNew && requests.length === 0 && drafts.length === 0 && submitted.length === 0 &&
      <section aria-labelledby="welcome" className="mt-6 rounded-2xl border border-gray-900 bg-white p-5 sm:p-6">
          <h2 id="welcome" className="text-[15px] font-semibold text-gray-900">
            Welcome, {buyer.contactName?.split(' ')[0] ?? buyer.name}
          </h2>
          <p className="mt-1 text-[13.5px] leading-relaxed text-gray-700">
            Your account is ready ({buyer.referenceId}). Start by drafting a request — you'll only be asked to verify your
            company when you send it for qualification.
          </p>
          <Link
            to="/buyer/requests"
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-5 text-[13.5px] font-semibold text-white hover:bg-black">

            Draft your first request
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      }

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((stat) =>
        <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <dt className="text-[12.5px] text-gray-600">{stat.label}</dt>
            <dd className="mt-1 font-display text-[26px] font-semibold tabular-nums text-gray-900">{stat.value}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="attention" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="attention" className="text-[15px] font-semibold text-gray-900">
          Needs your attention
        </h2>
        {attention.length === 0 ?
        <p className="mt-2 text-[13.5px] text-gray-600">
            Nothing right now. <Link to="/buyer/requests" className="font-medium text-gray-900 underline underline-offset-2">Post a request</Link> when
            you have work to source.
          </p> :

        <ul className="mt-3 divide-y divide-gray-100">
            {attention.map((item) =>
          <li key={item.text} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-[13.5px] text-gray-800">{item.text}</span>
                <Link
              to={item.to}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-gray-900 hover:bg-gray-50">

                  {item.action}
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
          )}
          </ul>
        }
      </section>

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
