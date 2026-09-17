import React, { useState } from 'react';
import { AlertTriangleIcon, BuildingIcon, CheckCircleIcon, DollarSignIcon, ShieldCheckIcon, XCircleIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ReconciliationPanel } from '../components/console/ReconciliationPanel';
import { ShareBarList } from '../components/console/ShareBarList';
import { PolicySimulator } from '../components/console/PolicySimulator';
import { IncentiveAuditLedger } from '../components/console/IncentiveAuditLedger';
import {
  headlineMetric,
  institutionReconciliation,
  regionalDistribution,
  inclusionBreakdown,
  type ReconciliationStatus } from
'../data/observatory';
import { policyScenarioReports, type PolicyScenarioReport } from '../data/policyScenarios';
import { runPolicySimulation, type PolicyScenarioInputs } from '../lib/policySimulation';
import { incentiveApplications } from '../data/incentives';
import { actors } from '../data/actors';
import { auditIncentiveApplication } from '../lib/incentiveAudit';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const actorsById = new Map(actors.map((actor) => [actor.id, actor]));
const baselineExportVolumeUsd = 14250000;

export function ConsoleObservatory() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [overrides, setOverrides] = useState<Record<string, ReconciliationStatus>>({});
  const [scenarioReports, setScenarioReports] = useState<PolicyScenarioReport[]>(policyScenarioReports);

  const statusOf = (item: (typeof institutionReconciliation)[number]) => overrides[item.institution] ?? item.status;

  const reconciledCount = institutionReconciliation.filter((item) => statusOf(item) === 'reconciled').length;
  const flaggedClaimsTotal = institutionReconciliation.reduce(
    (total, item) => total + (statusOf(item) === 'reconciled' ? 0 : item.flaggedClaims),
    0
  );

  const auditResults = incentiveApplications.map((application) => ({
    application,
    result: auditIncentiveApplication(application, actorsById.get(application.actorId))
  }));
  const avtIssuedCount = auditResults.filter((item) => item.result.passed).length;
  const auditRejectedCount = auditResults.filter((item) => !item.result.passed).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-observatory-reconciliation.csv',
      institutionReconciliation.map((item) => ({
        institution: item.institution,
        fullName: item.fullName,
        status: statusOf(item),
        lastSynced: item.lastSynced,
        flaggedClaims: statusOf(item) === 'reconciled' ? 0 : item.flaggedClaims
      }))
    );
    logEvent(`Exported the Observatory reconciliation register (${institutionReconciliation.length} rows)`, 'observatory', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Observatory" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Observatory</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          The policy drill-down behind the public headline number — reconciliation and inclusion, not just the total.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSignIcon}
          label={headlineMetric.label}
          value={`$${headlineMetric.value.toFixed(2)}${headlineMetric.unit.split(' ')[0]}`}
          delta="Quarter to date"
          positive
          accent="gate" />

        <StatCard
          icon={BuildingIcon}
          label="Institutions reconciled"
          value={`${reconciledCount} / ${institutionReconciliation.length}`}
          delta="Observatory"
          positive
          accent="sky" />

        <StatCard
          icon={AlertTriangleIcon}
          label="Flagged duplicate claims"
          value={flaggedClaimsTotal.toString()}
          delta="Needs attention"
          positive={false}
          accent="rose" />

        <StatCard
          icon={CheckCircleIcon}
          label="Regions represented"
          value={regionalDistribution.length.toString()}
          delta="Observatory"
          positive
          accent="gold" />

      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard
          icon={ShieldCheckIcon}
          label="Audit Verification Tokens issued"
          value={avtIssuedCount.toString()}
          delta="Cleared all 3 conditions"
          positive
          accent="gate" />

        <StatCard
          icon={XCircleIcon}
          label="Rejected by anti-leakage audit"
          value={auditRejectedCount.toString()}
          delta="Blocked before payout"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6 space-y-6">
        <ReconciliationPanel
          institutions={institutionReconciliation}
          overrides={overrides}
          canMutate={mutable}
          onResolve={(institution) => setOverrides((current) => ({ ...current, [institution]: 'reconciled' }))} />


        <div className="grid gap-6 lg:grid-cols-2">
          <ShareBarList
            title="Regional distribution"
            caption="Share of reconciled export value by exporter state."
            items={regionalDistribution.map((item) => ({ label: item.region, share: item.share }))} />

          <ShareBarList
            title="Inclusion breakdown"
            caption="Share of active verified exporters by policy-tracked segment."
            items={inclusionBreakdown.map((item) => ({ label: item.segment, share: item.share }))} />

        </div>

        <IncentiveAuditLedger applications={incentiveApplications} actorsById={actorsById} />

        <PolicySimulator
          reports={scenarioReports}
          canMutate={mutable}
          onRun={(inputs: PolicyScenarioInputs) => {
            const report: PolicyScenarioReport = {
              id: `sim-${Date.now()}`,
              runOn: 'Just now',
              runBy: `${profile.name}, ${profile.title}`,
              inputs,
              projections: runPolicySimulation(inputs, baselineExportVolumeUsd)
            };
            setScenarioReports((current) => [report, ...current]);
            logEvent(
              `Ran a policy simulation (grant match ${inputs.grantMatchPercent}%, tax rebate ${inputs.taxRebatePercent}%)`,
              'observatory',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
