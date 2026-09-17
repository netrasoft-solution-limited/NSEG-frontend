import React from 'react';
import { CheckCircle2Icon, EyeOffIcon, HourglassIcon, InfoIcon, UserCheckIcon } from 'lucide-react';
import { BuyerLayout } from '../components/workspace/BuyerLayout';
import { TierBadge } from '../components/workspace/TierBadge';
import { trustTiers } from '../data/trustTiers';
import { useBuyerSession } from '../lib/buyerSession';
import { buyerOpportunities, buyerShortlist, engagedCandidateId, requestStatusFor } from '../lib/buyerWorkspace';
import { sectorLabel } from '../lib/marketplaceLookups';
import { useAuditLog } from '../lib/auditLog';
import { usePendingAction } from '../lib/usePendingAction';
import { Spinner } from '../components/common/Spinner';
import { useGatewayExchange } from '../lib/gatewayExchange';

export function BuyerShortlists() {
  const { buyer, state, update } = useBuyerSession();
  const { logEvent } = useAuditLog();
  const { introductions, requestIntroduction } = useGatewayExchange();
  const { run, pending, isPending } = usePendingAction();

  const withShortlists = buyerOpportunities(buyer).
  map((opportunity) => ({ opportunity, candidates: buyerShortlist(opportunity, introductions) })).
  filter((item) => item.candidates);
  const awaiting = buyerOpportunities(buyer).filter(
    (opportunity) => requestStatusFor(opportunity) === 'shortlisting' && !buyerShortlist(opportunity)
  );

  return (
    <BuyerLayout
      title="Introductions"
      intro="Exporters a desk officer has matched and approved for your requirements. You see why each one matches; you see who they are only once they consent to share their details.">

      {withShortlists.length === 0 &&
      <p className="rounded-2xl border border-gray-200 bg-white p-5 text-[13.5px] text-gray-600">
          No approved shortlists yet. They appear here once a desk officer approves a match for one of your requests.
        </p>
      }

      {awaiting.length > 0 &&
      <p className="mb-6 flex gap-2 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-900">
          <HourglassIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          A desk officer is still preparing the shortlist for {awaiting.map((item) => `"${item.title}"`).join(', ')}.
        </p>
      }

      <div className="space-y-6">
        {withShortlists.map(({ opportunity, candidates }) => {
          const selectedId = state.selections[opportunity.id] ?? engagedCandidateId(opportunity);
          return (
            <section
              key={opportunity.id}
              aria-labelledby={`sl-${opportunity.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

              <h2 id={`sl-${opportunity.id}`} className="text-[16px] font-semibold text-gray-900">
                {opportunity.title}
              </h2>
              <p className="mt-0.5 text-[12.5px] text-gray-600">
                {sectorLabel(opportunity.sectorCode)} · {candidates!.length} exporters · approved by a NATEP desk officer
              </p>

              <ol className="mt-4 space-y-3">
                {candidates!.map(({ candidate, actor, disclosed, introduction }, index) => {
                  const tier = actor ? trustTiers.find((item) => item.id === actor.tier) : undefined;
                  const response = introduction?.response;
                  const selected = selectedId === candidate.id;
                  const displayName = disclosed ? candidate.name : `Exporter ${String.fromCharCode(65 + index)}`;
                  return (
                    <li
                      key={candidate.id}
                      className={`rounded-xl border p-4 ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200'}`}>

                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-1.5 text-[15px] font-semibold text-gray-900">
                            {!disclosed && <EyeOffIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />}
                            {displayName}
                          </p>
                          <p className="text-[12.5px] text-gray-600">
                            {disclosed ?
                            <span className="font-mono">{candidate.natepId}</span> :
                            'Identity shared once the exporter consents'}
                          </p>
                        </div>
                        {tier && <TierBadge tier={tier} />}
                      </div>

                      <div className="mt-3">
                        <p className="text-[12.5px] font-medium text-gray-700">
                          Why they match · <span className="tabular-nums">{candidate.score}</span>/100
                        </p>
                        <dl className="mt-1.5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                          {candidate.factors.map((factor) =>
                          <div key={factor.label}>
                              <div className="flex justify-between text-[12.5px]">
                                <dt className="text-gray-700">{factor.label}</dt>
                                <dd className="tabular-nums text-gray-900">
                                  {factor.got} of {factor.weight}
                                </dd>
                              </div>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100" role="presentation">
                                <div
                                className="h-full rounded-full bg-gray-900"
                                style={{ width: `${factor.got / factor.weight * 100}%` }} />

                              </div>
                            </div>
                          )}
                        </dl>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {disclosed ?
                        selected ?
                        <span className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-emerald-800">
                              <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                              You chose to proceed with {candidate.name}
                            </span> :

                        <button
                          type="button"
                          onClick={() =>
                          run(`proceed-${candidate.id}`, () => {
                            update({ selections: { ...state.selections, [opportunity.id]: candidate.id } });
                            logEvent(
                              `${buyer.name} chose to proceed with ${candidate.name} for "${opportunity.title}"`,
                              'engagements',
                              buyer.name
                            );
                          })
                          }
                          disabled={Boolean(pending)}
                          aria-busy={isPending(`proceed-${candidate.id}`) || undefined}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-gray-900 px-4 text-[13px] font-semibold text-white hover:bg-black disabled:cursor-progress disabled:bg-gray-800">

                              {isPending(`proceed-${candidate.id}`) ? <Spinner /> : <UserCheckIcon className="h-4 w-4" aria-hidden="true" />}
                              {isPending(`proceed-${candidate.id}`) ? 'Recording your choice…' : 'Proceed with this exporter'}
                            </button> :

                        response === 'pending' ?
                        <span className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-gray-700">
                            <HourglassIcon className="h-4 w-4" aria-hidden="true" />
                            Introduction requested — the exporter decides whether to share their profile
                          </span> :
                        response === 'declined' || response === 'withdrawn' ?
                        <span className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-gray-700">
                            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                            {response === 'declined' ?
                          'The exporter chose not to share their profile' :
                          'The exporter withdrew consent to share their profile'}
                          </span> :

                        <button
                          type="button"
                          onClick={() => {
                            if (!actor) return;
                            run(`intro-${candidate.id}`, () => {
                              requestIntroduction({
                                id: candidate.id,
                                opportunityId: opportunity.id,
                                buyerId: buyer.id,
                                actorId: actor.id
                              });
                              logEvent(
                                `${buyer.name} requested an introduction to a shortlisted exporter for "${opportunity.title}"`,
                                'consent',
                                buyer.name
                              );
                            });
                          }}
                          disabled={Boolean(pending)}
                          aria-busy={isPending(`intro-${candidate.id}`) || undefined}
                          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-4 text-[13px] font-medium text-gray-800 hover:border-gray-500 disabled:cursor-progress">

                            {isPending(`intro-${candidate.id}`) && <Spinner />}
                            {isPending(`intro-${candidate.id}`) ? 'Sending request…' : 'Request introduction'}
                          </button>
                        }
                      </div>
                    </li>);

                })}
              </ol>
            </section>);

        })}
      </div>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        The match score explains the fit for this request — it isn't a rating of the exporter's work. Tier badges state
        what NATEP has verified. Choosing an exporter is your decision; the Gateway only records it.
      </p>
    </BuyerLayout>);

}
