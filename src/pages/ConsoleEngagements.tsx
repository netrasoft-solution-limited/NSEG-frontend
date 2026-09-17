import React, { useState } from 'react';
import { AlertTriangleIcon, FileCheckIcon, HandshakeIcon, HourglassIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { EngagementTracker } from '../components/console/EngagementTracker';
import { engagements } from '../data/engagements';
import { opportunities } from '../data/opportunities';
import { consentGrants } from '../data/consentGrants';
import { actors } from '../data/actors';
import { vaultDocuments } from '../data/vaultDocuments';
import { engagementStageLabels, isTerminalStage, nextStage, type EngagementStage } from '../lib/engagementStage';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const opportunitiesById = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]));
const consentGrantsById = new Map(consentGrants.map((grant) => [grant.id, grant]));
const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleEngagements() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [stages, setStages] = useState<Record<string, EngagementStage>>({});

  const stageOf = (id: string, fallback: EngagementStage) => stages[id] ?? fallback;

  const needsInvalidationCount = engagements.filter((engagement) => {
    const consent = consentGrantsById.get(engagement.consentGrantId);
    const stage = stageOf(engagement.id, engagement.stage);
    return consent?.status !== 'active' && !isTerminalStage(stage);
  }).length;

  const awaitingBuyerCount = engagements.filter(
    (engagement) => stageOf(engagement.id, engagement.stage) === 'buyer-reviewing'
  ).length;

  const contractedCount = engagements.filter((engagement) =>
  ['contract-signed', 'commenced'].includes(stageOf(engagement.id, engagement.stage))
  ).length;

  const activeCount = engagements.filter((engagement) => {
    const stage = stageOf(engagement.id, engagement.stage);
    const consent = consentGrantsById.get(engagement.consentGrantId);
    return consent?.status === 'active' && !isTerminalStage(stage);
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
          stage: engagementStageLabels[stageOf(engagement.id, engagement.stage)],
          consentStatus: consent?.status ?? 'unknown'
        };
      })
    );
    logEvent(`Exported the engagement tracker (${engagements.length} rows)`, 'engagements', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Engagements" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Engagements</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
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
          stages={stages}
          onAdvance={(id) => {
            const engagement = engagements.find((item) => item.id === id);
            if (!engagement) return;
            const stage = stageOf(id, engagement.stage);
            const upcoming = nextStage(stage);
            if (!upcoming) return;
            setStages((current) => ({ ...current, [id]: upcoming }));
            const opportunity = opportunitiesById.get(engagement.opportunityId);
            logEvent(
              `Advanced the referral for "${opportunity?.title ?? engagement.opportunityId}" to ${engagementStageLabels[upcoming]}`,
              'engagements',
              profile.name
            );
          }}
          onDecline={(id) => {
            setStages((current) => ({ ...current, [id]: 'declined' }));
            const engagement = engagements.find((item) => item.id === id);
            const opportunity = engagement ? opportunitiesById.get(engagement.opportunityId) : undefined;
            logEvent(
              `Marked the referral for "${opportunity?.title ?? id}" as declined by the buyer`,
              'engagements',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
