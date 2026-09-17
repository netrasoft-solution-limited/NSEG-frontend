import React from 'react';
import { AlertTriangleIcon, FileCheckIcon, HandshakeIcon, HourglassIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { EngagementTracker } from '../components/console/EngagementTracker';
import { opportunities } from '../data/opportunities';
import { actors } from '../data/actors';
import { vaultDocuments } from '../data/vaultDocuments';
import { engagementStageLabels, isTerminalStage } from '../lib/engagementStage';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { useEngagementLedger } from '../lib/engagementLedger';

const opportunitiesById = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]));
const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleEngagements() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const { engagements, consentGrants, advanceStage, declineEngagement } = useEngagementLedger();
  const consentGrantsById = new Map(consentGrants.map((grant) => [grant.id, grant]));

  // A referral outlives neither its consent nor its own stage: revoking the grant in the
  // consent register lands here as work to invalidate (BRD §3.8).
  const needsInvalidationCount = engagements.filter((engagement) => {
    const consent = consentGrantsById.get(engagement.consentGrantId);
    return consent?.status !== 'active' && !isTerminalStage(engagement.stage);
  }).length;

  const awaitingBuyerCount = engagements.filter((engagement) => engagement.stage === 'buyer-reviewing').length;

  const contractedCount = engagements.filter((engagement) =>
  ['contract-signed', 'commenced'].includes(engagement.stage)
  ).length;

  const activeCount = engagements.filter((engagement) => {
    const consent = consentGrantsById.get(engagement.consentGrantId);
    return consent?.status === 'active' && !isTerminalStage(engagement.stage);
  }).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-engagements.csv',
      engagements.map((engagement) => {
        const consent = consentGrantsById.get(engagement.consentGrantId);
        const opportunity = opportunitiesById.get(engagement.opportunityId);
        const actor = consent ? actorsById.get(consent.actorId) : undefined;
        return {
          opportunity: opportunity?.title ?? engagement.opportunityId,
          exporter: actor?.name ?? '',
          buyer: consent?.recipient ?? '',
          stage: engagementStageLabels[engagement.stage],
          consentStatus: consent?.status ?? 'unknown'
        };
      })
    );
    logEvent(`Exported the engagement tracker (${engagements.length} rows)`, 'engagements', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Engagements" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Engagements</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          Track consented referrals from disclosure through to contract — a referral's access dies the moment its
          consent grant does.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HandshakeIcon}
          label="Active referrals"
          value={activeCount.toString()}
          delta="In progress"
          positive
          accent="sky" />

        <StatCard
          icon={HourglassIcon}
          label="Awaiting buyer response"
          value={awaitingBuyerCount.toString()}
          delta="Buyer reviewing"
          positive
          accent="gold" />

        <StatCard
          icon={FileCheckIcon}
          label="Contracted"
          value={contractedCount.toString()}
          delta="Signed or commenced"
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Needs invalidation"
          value={needsInvalidationCount.toString()}
          delta="Consent lapsed"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <EngagementTracker
          engagements={engagements}
          opportunitiesById={opportunitiesById}
          consentGrantsById={consentGrantsById}
          actorsById={actorsById}
          vaultDocuments={vaultDocuments}
          canMutate={mutable}
          onAdvance={(id) => advanceStage(id, profile.name)}
          onDecline={(id) => declineEngagement(id, profile.name)}
          onViewPackage={(id) => {
            const engagement = engagements.find((item) => item.id === id);
            const consent = engagement ? consentGrantsById.get(engagement.consentGrantId) : undefined;
            logEvent(
              `Viewed the disclosure package sent to ${consent?.recipient ?? 'a recipient'}`,
              'consent',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
