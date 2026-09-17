import React, { useState } from 'react';
import { AlertTriangleIcon, BanknoteIcon, CheckCircleIcon, HourglassIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { OutcomeLedger } from '../components/console/OutcomeLedger';
import { outcomeReports, type OutcomeVerificationStatus } from '../data/outcomes';
import { engagements } from '../data/engagements';
import { opportunities } from '../data/opportunities';
import { consentGrants } from '../data/consentGrants';
import { actors } from '../data/actors';
import { groupReportsByEngagement } from '../lib/outcomeVerification';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const engagementsById = new Map(engagements.map((engagement) => [engagement.id, engagement]));
const opportunitiesById = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]));
const consentGrantsById = new Map(consentGrants.map((grant) => [grant.id, grant]));
const actorsById = new Map(actors.map((actor) => [actor.id, actor]));

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function ConsoleOutcomes() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const [decisions, setDecisions] = useState<Record<string, OutcomeVerificationStatus>>({});

  const statusOf = (id: string, fallback: OutcomeVerificationStatus) => decisions[id] ?? fallback;

  const provisionalCount = outcomeReports.filter(
    (report) => statusOf(report.id, report.verification) === 'provisional'
  ).length;

  const verifiedReports = outcomeReports.filter((report) => statusOf(report.id, report.verification) === 'verified');
  const verifiedValue = verifiedReports.reduce((total, report) => total + report.amount, 0);

  const duplicateRiskGroups = Array.from(groupReportsByEngagement(outcomeReports).values()).filter((group) => {
    const live = group.map((report) => statusOf(report.id, report.verification));
    return live.filter((status) => status !== 'rejected').length > 1;
  }).length;

  const rejectedCount = outcomeReports.filter(
    (report) => statusOf(report.id, report.verification) === 'rejected'
  ).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-outcome-reports.csv',
      outcomeReports.map((report) => {
        const engagement = engagementsById.get(report.engagementId);
        const opportunity = engagement ? opportunitiesById.get(engagement.opportunityId) : undefined;
        return {
          opportunity: opportunity?.title ?? report.engagementId,
          reportedBy: report.reportedBy,
          amount: report.amount,
          currency: report.currency,
          reportedOn: report.reportedOn,
          verification: statusOf(report.id, report.verification)
        };
      })
    );
    logEvent(`Exported the outcome ledger (${outcomeReports.length} rows)`, 'outcomes', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Outcomes" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Outcomes</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Verify self-reported export value before it counts toward the National Observatory — once,
          not twice, per engagement.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HourglassIcon}
          label="Awaiting verification"
          value={provisionalCount.toString()}
          delta="Provisional"
          positive
          accent="gold" />

        <StatCard
          icon={BanknoteIcon}
          label="Verified export value"
          value={currency.format(verifiedValue)}
          delta={`${verifiedReports.length} outcome${verifiedReports.length === 1 ? '' : 's'}`}
          positive
          accent="gate" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Duplicate risk"
          value={duplicateRiskGroups.toString()}
          delta="Needs single-count decision"
          positive={false}
          accent="rose" />

        <StatCard
          icon={CheckCircleIcon}
          label="Rejected"
          value={rejectedCount.toString()}
          delta="Not counted"
          positive
          accent="sky" />

      </div>

      <div className="mt-6">
        <OutcomeLedger
          reports={outcomeReports}
          engagementsById={engagementsById}
          opportunitiesById={opportunitiesById}
          consentGrantsById={consentGrantsById}
          actorsById={actorsById}
          decisions={decisions}
          onDecide={(id, status) => {
            setDecisions((current) => ({ ...current, [id]: status }));
            const report = outcomeReports.find((item) => item.id === id);
            const engagement = report ? engagementsById.get(report.engagementId) : undefined;
            const opportunity = engagement ? opportunitiesById.get(engagement.opportunityId) : undefined;
            logEvent(
              status === 'verified' ?
              `Verified ${currency.format(report?.amount ?? 0)} in export value for "${opportunity?.title ?? id}"` :
              `Rejected an outcome report for "${opportunity?.title ?? id}"`,
              'outcomes',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
