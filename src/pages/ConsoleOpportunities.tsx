import React, { useState } from 'react';
import { CheckCheckIcon, ClockIcon, InboxIcon, ScaleIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { SignalQueue, type SignalDecision } from '../components/console/SignalQueue';
import { ShortlistReview, type ShortlistDecision } from '../components/console/ShortlistReview';
import { signals } from '../data/signals';
import { opportunities } from '../data/opportunities';
import { shortlists } from '../data/shortlists';
import { supportingMetrics } from '../data/observatory';
import { downloadCsv } from '../lib/exportCsv';

const medianQualificationTime =
supportingMetrics.find((metric) => metric.label === 'Median officer qualification time')?.value ?? '—';

const shortlistItems = shortlists.
map((shortlist) => {
  const opportunity = opportunities.find((item) => item.id === shortlist.opportunityId);
  return opportunity ? { opportunity, shortlist } : null;
}).
filter((item): item is {opportunity: (typeof opportunities)[number];shortlist: (typeof shortlists)[number];} => item !== null);

export function ConsoleOpportunities() {
  const [signalDecisions, setSignalDecisions] = useState<Record<string, SignalDecision>>({});
  const [shortlistDecisions, setShortlistDecisions] = useState<Record<string, ShortlistDecision>>({});

  const pendingSignals = signals.filter((signal) => (signalDecisions[signal.id] ?? 'pending') === 'pending').length;
  const qualifiedToday = Object.values(signalDecisions).filter((decision) => decision === 'qualified').length;
  const pendingShortlists = shortlistItems.filter(
    ({ opportunity }) => (shortlistDecisions[opportunity.id] ?? 'pending') === 'pending'
  ).length;
  const approvedToday = Object.values(shortlistDecisions).filter((decision) => decision === 'approved').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-signal-queue.csv',
      signals.map((signal) => ({
        route: signal.route,
        origin: signal.origin,
        receivedOn: signal.receivedOn,
        riskTier: signal.riskTier,
        decision: signalDecisions[signal.id] ?? 'pending'
      }))
    );
  };

  return (
    <ConsoleLayout breadcrumb="Opportunities" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Opportunities</h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Qualify inbound signals, then approve the shortlist before any exporter is contacted.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Signals awaiting qualification"
          value={pendingSignals.toString()}
          delta={`${qualifiedToday} qualified today`}
          positive
          accent="sky" />

        <StatCard
          icon={ScaleIcon}
          label="Shortlists awaiting approval"
          value={pendingShortlists.toString()}
          delta={`${approvedToday} approved today`}
          positive
          accent="gate" />

        <StatCard
          icon={CheckCheckIcon}
          label="Qualified today"
          value={qualifiedToday.toString()}
          delta="+decision"
          positive
          accent="gold" />

        <StatCard
          icon={ClockIcon}
          label="Median time to qualify"
          value={medianQualificationTime}
          delta="platform baseline"
          positive
          accent="rose" />

      </div>

      <div className="mt-6 space-y-6">
        <SignalQueue
          signals={signals}
          decisions={signalDecisions}
          onDecide={(id, decision) => setSignalDecisions((current) => ({ ...current, [id]: decision }))} />


        <ShortlistReview
          items={shortlistItems}
          decisions={shortlistDecisions}
          onDecide={(id, decision) => setShortlistDecisions((current) => ({ ...current, [id]: decision }))} />

      </div>
    </ConsoleLayout>);

}
