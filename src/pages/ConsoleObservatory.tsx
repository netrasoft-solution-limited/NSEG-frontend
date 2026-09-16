import React, { useState } from 'react';
import { AlertTriangleIcon, BuildingIcon, CheckCircleIcon, DollarSignIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ReconciliationPanel } from '../components/console/ReconciliationPanel';
import { ShareBarList } from '../components/console/ShareBarList';
import {
  headlineMetric,
  institutionReconciliation,
  regionalDistribution,
  inclusionBreakdown,
  type ReconciliationStatus } from
'../data/observatory';
import { downloadCsv } from '../lib/exportCsv';

export function ConsoleObservatory() {
  const [overrides, setOverrides] = useState<Record<string, ReconciliationStatus>>({});

  const statusOf = (item: (typeof institutionReconciliation)[number]) => overrides[item.institution] ?? item.status;

  const reconciledCount = institutionReconciliation.filter((item) => statusOf(item) === 'reconciled').length;
  const flaggedClaimsTotal = institutionReconciliation.reduce(
    (total, item) => total + (statusOf(item) === 'reconciled' ? 0 : item.flaggedClaims),
    0
  );

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
  };

  return (
    <ConsoleLayout breadcrumb="Observatory" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Observatory</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
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

      <div className="mt-6 space-y-6">
        <ReconciliationPanel
          institutions={institutionReconciliation}
          overrides={overrides}
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
      </div>
    </ConsoleLayout>);

}
