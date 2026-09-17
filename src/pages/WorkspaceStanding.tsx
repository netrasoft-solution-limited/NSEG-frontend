import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, CircleIcon, InfoIcon, LockIcon, UnlockIcon } from 'lucide-react';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';
import { TierBadge } from '../components/workspace/TierBadge';
import { evidenceLabels, trustTiers } from '../data/trustTiers';
import { useExporterSession } from '../lib/exporterSession';
import { useAccounts } from '../lib/accounts';
import { computeReadinessScore } from '../lib/readinessScore';
import { exporterStanding } from '../lib/exporterTier';
import { readinessParameterWeights, readinessTierFor } from '../lib/readinessScore';

function Requirement({ met, children }: {met: boolean;children: React.ReactNode;}) {
  return (
    <li className="flex items-start gap-2 text-[13px]">
      {met ?
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /> :

      <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
      }
      <span className={met ? 'text-gray-800' : 'text-gray-600'}>
        {children}
        <span className="sr-only">{met ? ' (done)' : ' (not yet)'}</span>
      </span>
    </li>);

}

export function WorkspaceStanding() {
  const { actor, workspace } = useExporterSession();
  const standing = exporterStanding(actor);
  const tierIndex = trustTiers.indexOf(standing.tier);
  const band = readinessTierFor(standing.score);
  const actionTarget = standing.missingEvidence.length > 0 ? '/workspace/readiness' : '/workspace/readiness#diagnostic';
  const accounts = useAccounts();
  const isNewAccount = accounts.isNewAccount(actor.id);
  const identityKeys = trustTiers[1].evidence[actor.track];
  const identityMissing = identityKeys.filter(
    (key) => !actor.verifiedEvidence.includes(key) && !actor.pendingEvidence?.includes(key)
  );
  const identityStarted = identityMissing.length === 0;
  const setupSteps = [
  { label: `Account created · ${actor.natepId}`, done: true, to: undefined },
  {
    label: identityStarted ?
    'Identity details sent for verification' :
    `Add your ${identityMissing.map((key) => evidenceLabels[key].toLowerCase()).join(' and ')} for verification`,
    done: identityStarted,
    to: '/workspace/readiness'
  },
  {
    label: workspace.diagnosticSubmitted ? 'Readiness diagnostic sent for review' : 'Take the readiness diagnostic',
    done: computeReadinessScore(actor.diagnostic) > 0 || workspace.diagnosticSubmitted,
    to: '/workspace/readiness#diagnostic'
  },
  { label: 'Check which export requirements apply to you', done: false, to: '/workspace/requirements' }];


  return (
    <WorkspaceLayout
      title="My standing"
      intro="Your tier, what has been verified to get you there, and the one thing that moves you to the next tier.">

      {isNewAccount &&
      <section aria-labelledby="setup" className="mb-6 rounded-2xl border border-gray-900 bg-white p-5 sm:p-6">
          <h2 id="setup" className="text-[15px] font-semibold text-gray-900">
            Finish setting up
          </h2>
          <p className="mt-1 text-[13.5px] text-gray-700">
            You can explore everything now. Verification only matters when you're ready to bid.
          </p>
          <ol className="mt-3 space-y-1.5">
            {setupSteps.map((item) =>
          <li key={item.label} className="flex items-start gap-2 text-[13.5px]">
                {item.done ?
            <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /> :

            <CircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
            }
                {item.to && !item.done ?
            <Link to={item.to} className="font-medium text-gray-900 underline underline-offset-2">
                    {item.label}
                  </Link> :

            <span className={item.done ? 'text-gray-700' : 'text-gray-900'}>{item.label}</span>
            }
                <span className="sr-only">{item.done ? '(done)' : '(to do)'}</span>
              </li>
          )}
          </ol>
        </section>
      }

      <section aria-labelledby="current-tier" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="current-tier" className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray-600">
              Your tier
            </h2>
            <div className="mt-2">
              <TierBadge tier={standing.tier} size="lg" />
            </div>
            <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-gray-700">{standing.tier.verifies}.</p>
          </div>
          <div className="text-right">
            <p className="font-display text-[34px] font-semibold leading-none tabular-nums text-gray-900">
              {standing.score}
              <span className="text-[15px] font-medium text-gray-500">/100</span>
            </p>
            <p className="mt-1 text-[12px] text-gray-600">Readiness diagnostic · {band.label}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-gray-900 p-4 text-white">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-gray-300">Your next step</p>
          <p className="mt-1.5 text-[15px] leading-snug">{standing.nextAction}</p>
          {standing.next &&
          <Link
            to={actionTarget}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white px-4 text-[13px] font-semibold text-gray-900 transition-colors duration-150 ease-out hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">

              {standing.missingEvidence.length > 0 ? 'Check my evidence' : 'Update my diagnostic'}
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="unlocked-now" className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 id="unlocked-now" className="text-[15px] font-semibold text-gray-900">
            What you can do now
          </h2>
          <ul className="mt-3 space-y-2">
            {standing.tier.unlocked.map((item) =>
            <li key={item} className="flex items-start gap-2 text-[13.5px] text-gray-800">
                <UnlockIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                {actor.suspended ? <span>{item} <span className="text-rose-700">(paused)</span></span> : item}
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="unlocked-next" className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 id="unlocked-next" className="text-[15px] font-semibold text-gray-900">
            {standing.next ? `${standing.next.badge} adds` : 'Holding your tier'}
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

      <section aria-labelledby="ladder" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="ladder" className="text-[15px] font-semibold text-gray-900">
          The ladder for {actor.track === 'firm' ? 'registered firms' : 'individual professionals'}
        </h2>
        <p className="mt-1 text-[13px] text-gray-600">
          A tier needs both its diagnostic score and its evidence. A high score alone never moves you up.
        </p>

        <ol className="mt-4 space-y-3">
          {trustTiers.map((tier, index) => {
            const reached = index <= tierIndex;
            const isNext = index === tierIndex + 1;
            const evidence = tier.evidence[actor.track];
            return (
              <li
                key={tier.id}
                aria-current={index === tierIndex ? 'step' : undefined}
                className={`rounded-xl border p-4 ${
                index === tierIndex ?
                'border-gray-900' :
                isNext ?
                'border-dashed border-gray-400' :
                'border-gray-200'}`
                }>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TierBadge tier={tier} />
                  <span className="text-[12px] font-medium text-gray-600">
                    {index === tierIndex ? 'You are here' : reached ? 'Reached' : isNext ? 'Next' : 'Later'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {tier.minDiagnostic > 0 &&
                  <Requirement met={standing.score >= tier.minDiagnostic}>
                      Diagnostic score of {tier.minDiagnostic} or more{' '}
                      <span className="text-gray-500">(yours: {standing.score})</span>
                    </Requirement>
                  }
                  {evidence.map((key) =>
                  <Requirement key={key} met={actor.verifiedEvidence.includes(key)}>
                      {evidenceLabels[key]} verified
                    </Requirement>
                  )}
                  {tier.minDiagnostic === 0 && evidence.length === 0 &&
                  <Requirement met>Account created</Requirement>
                  }
                </ul>
              </li>);

          })}
        </ol>
      </section>

      <section aria-labelledby="diagnostic" className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="diagnostic" className="text-[15px] font-semibold text-gray-900">
          Your diagnostic, by area
        </h2>
        <p className="mt-1 text-[13px] text-gray-600">Weighted into your score of {standing.score}.</p>
        <dl className="mt-4 space-y-3">
          {readinessParameterWeights.map(({ key, label, weight }) => {
            const value = actor.diagnostic[key];
            const weakest = key === standing.weakestParameter.key;
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <dt className="text-gray-800">
                    {label} <span className="text-gray-500">· {Math.round(weight * 100)}%</span>
                    {weakest && standing.next &&
                    <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Lowest area
                      </span>
                    }
                  </dt>
                  <dd className="font-mono text-[12px] tabular-nums text-gray-700">{value}</dd>
                </div>
                <div
                  className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"
                  role="presentation">

                  <div
                    className={`h-full rounded-full ${weakest && standing.next ? 'bg-amber-500' : 'bg-gray-900'}`}
                    style={{ width: `${value}%` }} />

                </div>
              </div>);

          })}
        </dl>
      </section>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Tiers say what has been verified about you. They are not a rating of the quality of your work, and
        they are not a government endorsement.
      </p>
    </WorkspaceLayout>);

}
