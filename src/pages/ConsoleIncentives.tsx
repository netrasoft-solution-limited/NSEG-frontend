import React, { useState } from 'react';
import { BadgeCheckIcon, ClockIcon, SparklesIcon, WalletIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { IncentiveQueue } from '../components/console/IncentiveQueue';
import { incentiveApplications, incentiveTypeLabels, type IncentiveReviewStatus } from '../data/incentives';
import { actors } from '../data/actors';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

export function ConsoleIncentives() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [decisions, setDecisions] = useState<Record<string, IncentiveReviewStatus>>({});

  const statusOf = (id: string, fallback: IncentiveReviewStatus) => decisions[id] ?? fallback;

  const pending = incentiveApplications.filter(
    (application) => statusOf(application.id, application.reviewStatus) === 'pending'
  ).length;
  const preQualifiedCount = incentiveApplications.filter((application) => application.autoPreQualified).length;
  const approvedValue = incentiveApplications.
  filter((application) => statusOf(application.id, application.reviewStatus) === 'approved').
  reduce((total, application) => total + application.requestedAmount, 0);
  const approvedToday = Object.values(decisions).filter((status) => status === 'approved').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-incentive-applications.csv',
      incentiveApplications.map((application) => ({
        exporter: actorsById.get(application.actorId)?.name ?? application.actorId,
        type: incentiveTypeLabels[application.type],
        requestedAmount: application.requestedAmount,
        verifiedExportVolume: application.verifiedExportVolume,
        autoPreQualified: application.autoPreQualified ? 'yes' : 'no',
        submittedOn: application.submittedOn,
        reviewStatus: statusOf(application.id, application.reviewStatus)
      }))
    );
    logEvent(`Exported incentive applications (${incentiveApplications.length} rows)`, 'incentives', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Incentives" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Incentives</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Sign off on export expansion grants, tax credits and trade mission subsidies against verified export volume.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClockIcon}
          label="Applications awaiting review"
          value={pending.toString()}
          delta="Incentives"
          positive
          accent="sky" />

        <StatCard
          icon={SparklesIcon}
          label="Auto pre-qualified"
          value={preQualifiedCount.toString()}
          delta="Rules engine"
          positive
          accent="gold" />

        <StatCard
          icon={BadgeCheckIcon}
          label="Approved today"
          value={approvedToday.toString()}
          delta="+decision"
          positive
          accent="gate" />

        <StatCard
          icon={WalletIcon}
          label="Approved value"
          value={`$${approvedValue.toLocaleString()}`}
          delta="Lifetime ledger"
          positive
          accent="rose" />

      </div>

      <div className="mt-6">
        <IncentiveQueue
          applications={incentiveApplications}
          actorsById={actorsById}
          decisions={decisions}
          canApprove={profile.role === 'administrator'}
          canMutate={canMutate(profile.role)}
          onDecide={(id, status) => {
            setDecisions((current) => ({ ...current, [id]: status }));
            const application = incentiveApplications.find((item) => item.id === id);
            const actor = application ? actorsById.get(application.actorId) : undefined;
            logEvent(
              `${status === 'approved' ? 'Approved' : 'Declined'} a ${application ? incentiveTypeLabels[application.type] : 'an incentive'} application for ${actor?.name ?? 'an exporter'}`,
              'incentives',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
