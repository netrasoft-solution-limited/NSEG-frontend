import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BanIcon, CheckIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { EvidenceVault } from '../components/console/EvidenceVault';
import { ReadinessQueue } from '../components/console/ReadinessQueue';
import { ConsentRegister } from '../components/console/ConsentRegister';
import { DelegationRegistry } from '../components/console/DelegationRegistry';
import { IncentiveQueue } from '../components/console/IncentiveQueue';
import { EngagementTracker } from '../components/console/EngagementTracker';
import { TierBadge } from '../components/workspace/TierBadge';
import { KeyValue, Panel, Stat, StatGrid, Tag } from '../components/workspace/WorkspaceUI';
import { opportunities } from '../data/opportunities';
import { buyers } from '../data/buyers';
import { trustTiers } from '../data/trustTiers';
import { trackLabels } from '../data/trustTiers';
import { useAccounts } from '../lib/accounts';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { useDocumentVerification } from '../lib/documentVerification';
import { useEngagementLedger } from '../lib/engagementLedger';
import { useRegistryDecisions } from '../lib/registryDecisions';
import { canMutate } from '../lib/permissions';
import { exporterStanding } from '../lib/exporterTier';
import { sectorLabel } from '../lib/marketplaceLookups';

const opportunitiesById = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]));
const buyersById = new Map(buyers.map((buyer) => [buyer.id, buyer]));

/**
 * One exporter's whole record in one place. Every panel is the same component the registry-wide
 * queues use, handed only this exporter's rows — so a decision taken here is the decision the
 * queue shows, and an officer answering "is this exporter ready to bid?" stops visiting five
 * sections to find out.
 */
export function ConsoleExporterDetail() {
  const { actorId } = useParams<{actorId: string;}>();
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const accounts = useAccounts();
  const { documents, decide } = useDocumentVerification();
  const { engagements, consentGrants, advanceStage, declineEngagement, revokeConsent } = useEngagementLedger();
  const { submissions, applications, delegations, decideAssertion, decideIncentive, revokeDelegation, isSuspended, setSuspended } =
  useRegistryDecisions();

  const actor = accounts.exporters.find((item) => item.id === actorId);
  if (!actor) return <Navigate to="/console/exporters" replace />;

  const mutable = canMutate(profile.role);
  const actorsById = new Map([[actor.id, actor]]);
  const suspended = isSuspended(actor.id, actor.suspended);
  const standing = exporterStanding(actor);
  const tierIndex = trustTiers.indexOf(standing.tier);

  const theirDocuments = documents.filter((document) => document.actorId === actor.id);
  const theirSubmissions = submissions.filter((submission) => submission.actorId === actor.id);
  const theirGrants = consentGrants.filter((grant) => grant.actorId === actor.id);
  const theirDelegations = delegations.filter((delegation) => delegation.actorId === actor.id);
  const theirApplications = applications.filter((application) => application.actorId === actor.id);
  const grantIds = new Set(theirGrants.map((grant) => grant.id));
  const theirEngagements = engagements.filter((engagement) => grantIds.has(engagement.consentGrantId));
  const consentGrantsById = new Map(theirGrants.map((grant) => [grant.id, grant]));

  const verifiedDocuments = theirDocuments.filter((document) => document.verification === 'verified').length;
  const activeGrants = theirGrants.filter((grant) => grant.status === 'active').length;

  return (
    <ConsoleLayout breadcrumb={`Exporters · ${actor.name}`}>
      <Link
        to="/console/exporters"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900">

        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        All exporters
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
            {actor.name}
          </h1>
          <p className="mt-1.5 text-[14.5px] text-gray-600">
            {actor.contactName ? `${actor.contactName} · ` : ''}
            <span className="font-mono">{actor.natepId}</span> · {trackLabels[actor.track]} · {sectorLabel(actor.sectorCode)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={standing.tier} />
          {suspended && <Tag tone="clay">Suspended</Tag>}
        </div>
      </div>

      <div className="mt-6">
        <StatGrid>
          <Stat label="Trust tier" value={`${tierIndex + 1} of ${trustTiers.length}`} detail={standing.tier.badge} />
          <Stat label="Readiness" value={standing.score} detail={`Diagnostic out of 100`} />
          <Stat label="Evidence verified" value={verifiedDocuments} detail={`of ${theirDocuments.length} documents held`} />
          <Stat label="Active consents" value={activeGrants} detail={`${theirEngagements.length} referral${theirEngagements.length === 1 ? '' : 's'}`} />
        </StatGrid>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Record" intro="What the registry holds about this exporter.">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <KeyValue label="NATEP ID">
              <span className="font-mono">{actor.natepId}</span>
            </KeyValue>
            <KeyValue label="Registered">{actor.registeredOn}</KeyValue>
            <KeyValue label="Email">{actor.email}</KeyValue>
            <KeyValue label="Last active">{actor.lastActiveDaysAgo === 0 ? 'Today' : `${actor.lastActiveDaysAgo}d ago`}</KeyValue>
            <KeyValue label="Matches">{actor.matchCount}</KeyValue>
            <KeyValue label="Verification queue">{actor.verificationQueue === 'none' ? 'Clear' : actor.verificationQueue}</KeyValue>
          </dl>
          {actor.verificationNote &&
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-950">{actor.verificationNote}</p>
          }
        </Panel>

        <Panel title="Standing" intro="What moves this exporter to the next tier.">
          <p className="text-[14px] leading-relaxed text-gray-800">{standing.nextAction}</p>
          {mutable &&
          <button
            type="button"
            onClick={() => {
              setSuspended(actor.id, !suspended);
              logEvent(
                suspended ? `Reinstated ${actor.name}` : `Suspended ${actor.name} from bidding`,
                'exporters',
                profile.name
              );
            }}
            className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-300 px-4 text-[13.5px] font-medium text-gray-800 hover:border-gray-500">

              {suspended ?
            <>
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  Reinstate
                </> :

            <>
                  <BanIcon className="h-4 w-4" aria-hidden="true" />
                  Suspend from bidding
                </>
            }
            </button>
          }
        </Panel>
      </div>

      <div className="mt-6 space-y-6">
        <section aria-label="Readiness">
          {theirSubmissions.length === 0 ?
          <Panel title="Readiness">
              <p className="text-[13.5px] text-gray-600">No readiness submission from this exporter yet.</p>
            </Panel> :

          <ReadinessQueue
            submissions={theirSubmissions}
            actorsById={actorsById}
            decisions={{}}
            canMutate={mutable}
            onDecide={(id, status) => {
              decideAssertion(id, status);
              logEvent(
                status === 'issued' ?
                `Issued a Readiness Assertion for ${actor.name}` :
                `Withheld a Readiness Assertion for ${actor.name}`,
                'readiness',
                profile.name
              );
            }} />
          }
        </section>

        <section aria-label="Evidence">
          {theirDocuments.length === 0 ?
          <Panel title="Evidence">
              <p className="text-[13.5px] text-gray-600">
                Nothing in the vault for this exporter. Documents appear here as they upload them.
              </p>
            </Panel> :

          <EvidenceVault
            documents={theirDocuments}
            actorsById={actorsById}
            canMutate={mutable}
            onDecide={(id, status) => decide(id, status, profile.name)} />
          }
        </section>

        <section aria-label="Consent and disclosure">
          {theirGrants.length === 0 ?
          <Panel title="Consent and disclosure">
              <p className="text-[13.5px] text-gray-600">This exporter has not released their details to anyone.</p>
            </Panel> :

          <ConsentRegister
            grants={theirGrants}
            actorsById={actorsById}
            vaultDocuments={theirDocuments}
            canMutate={mutable}
            onRevoke={(id) => revokeConsent(id, profile.name)}
            onViewPackage={(id) => {
              const grant = theirGrants.find((item) => item.id === id);
              logEvent(
                `Viewed the disclosure package for ${actor.name} sent to ${grant?.recipient ?? 'a recipient'}`,
                'consent',
                profile.name
              );
            }} />
          }
        </section>

        {theirEngagements.length > 0 &&
        <section aria-label="Referrals">
            <EngagementTracker
            engagements={theirEngagements}
            opportunitiesById={opportunitiesById}
            consentGrantsById={consentGrantsById}
            actorsById={actorsById}
            vaultDocuments={theirDocuments}
            canMutate={mutable}
            onAdvance={(id) => advanceStage(id, profile.name)}
            onDecline={(id) => declineEngagement(id, profile.name)}
            onViewPackage={(id) => {
              const engagement = theirEngagements.find((item) => item.id === id);
              const consent = engagement ? consentGrantsById.get(engagement.consentGrantId) : undefined;
              logEvent(`Viewed the disclosure package sent to ${consent?.recipient ?? 'a recipient'}`, 'consent', profile.name);
            }} />

          </section>
        }

        <section aria-label="Delegated access">
          {theirDelegations.length === 0 ?
          <Panel title="Delegated access">
              <p className="text-[13.5px] text-gray-600">Nobody is acting on this organisation's behalf.</p>
            </Panel> :

          <DelegationRegistry
            delegations={theirDelegations}
            actorsById={actorsById}
            buyersById={buyersById}
            overrides={{}}
            canMutate={mutable}
            onRevoke={(id) => {
              revokeDelegation(id);
              logEvent(`Revoked a delegation on ${actor.name}`, 'delegations', profile.name);
            }} />
          }
        </section>

        {theirApplications.length > 0 &&
        <section aria-label="Incentives">
            <IncentiveQueue
            applications={theirApplications}
            actorsById={actorsById}
            decisions={{}}
            canApprove={profile.role === 'administrator'}
            canMutate={mutable}
            onDecide={(id, status) => {
              decideIncentive(id, status);
              logEvent(
                status === 'approved' ?
                `Approved an incentive application from ${actor.name}` :
                `Declined an incentive application from ${actor.name}`,
                'incentives',
                profile.name
              );
            }} />

          </section>
        }
      </div>
    </ConsoleLayout>);

}
