import React from 'react';
import { CheckCheckIcon, ClockIcon, InboxIcon, ScaleIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { opportunityTabs } from '../components/console/consoleTabs';
import { StatCard } from '../components/console/StatCard';
import { SignalQueue } from '../components/console/SignalQueue';
import { signals as seededSignals, type Signal } from '../data/signals';
import { buyers } from '../data/buyers';
import { supportingMetrics } from '../data/observatory';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { useGatewayExchange } from '../lib/gatewayExchange';
import { useCaseDecisions, type SignalDecision } from '../lib/caseDecisions';
import { useRegulatoryRegister } from '../lib/regulatoryRegister';
import { canMutate } from '../lib/permissions';

const medianQualificationTime =
supportingMetrics.find((metric) => metric.label === 'Median officer qualification time')?.value ?? '—';

/** Every inbound signal waits here until a named officer qualifies or rejects it, with a reason.
 * Matching is the next queue along — nothing is compared against capability until this decision
 * has been taken. */
export function ConsoleQualificationQueue() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const exchange = useGatewayExchange();
  const { signalDecisions: localDecisions, signalRecords, decideSignal } = useCaseDecisions();
  const { requirements } = useRegulatoryRegister();

  // DEM-03: requests buyers send from their workspace arrive as signals on that route, and the
  // officer's decision goes back to the buyer through the exchange.
  const workspaceSignals: Signal[] = exchange.requests.map((request) => {
    const buyer = buyers.find((item) => item.id === request.buyerId);
    return {
      id: request.id,
      route: 'Buyer workspace request',
      origin: buyer ? `${buyer.name} · ${buyer.region}` : 'Unknown buyer',
      sectorCode: request.sectorCode,
      receivedOn: 'just now',
      riskTier: buyer?.verificationQueue === 'flagged' ? 'Flagged' : buyer?.tier === 'payment-verified' ? 'New' : 'Review',
      summary: `"${request.title}" — ${request.summary} USD ${request.budgetMin.toLocaleString()}–${request.budgetMax.toLocaleString()}, target ${request.targetCompletion}.`
    };
  });
  const signals = [...workspaceSignals, ...seededSignals];
  const signalDecisions: Record<string, SignalDecision> = {
    ...localDecisions,
    ...Object.fromEntries(exchange.requests.map((request) => [request.id, request.decision]))
  };

  const pendingSignals = signals.filter((signal) => (signalDecisions[signal.id] ?? 'pending') === 'pending').length;
  const qualifiedCount = Object.values(signalDecisions).filter((decision) => decision === 'qualified').length;
  const rejectedCount = Object.values(signalDecisions).filter((decision) => decision === 'rejected').length;

  const handleExport = () => {
    downloadCsv(
      'nseg-qualification-queue.csv',
      signals.map((signal) => ({
        route: signal.route,
        origin: signal.origin,
        receivedOn: signal.receivedOn,
        riskTier: signal.riskTier,
        decision: signalDecisions[signal.id] ?? 'pending',
        reason: signalRecords[signal.id]?.reason ?? ''
      }))
    );
    logEvent(`Exported the qualification queue (${signals.length} rows)`, 'opportunities', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Opportunities · Qualification queue" onExport={handleExport} tabs={opportunityTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
          Qualification queue
        </h1>
        <p className="mt-1.5 max-w-3xl text-[14.5px] text-gray-600">
          Assess buyer authority, decision route and value credibility, then record a reason. The Gateway cannot
          qualify a signal on its own.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={InboxIcon}
          label="Awaiting qualification"
          value={pendingSignals.toString()}
          delta={pendingSignals ? 'Needs a decision' : 'Queue clear'}
          positive={pendingSignals === 0}
          accent="sky" />

        <StatCard
          icon={CheckCheckIcon}
          label="Qualified"
          value={qualifiedCount.toString()}
          delta="This session"
          positive
          accent="gate" />

        <StatCard
          icon={ScaleIcon}
          label="Rejected"
          value={rejectedCount.toString()}
          delta="Reason recorded"
          positive={false}
          accent="gold" />

        <StatCard
          icon={ClockIcon}
          label="Median time to qualify"
          value={medianQualificationTime}
          delta="Platform baseline"
          positive
          accent="rose" />

      </div>

      <div className="mt-6">
        <SignalQueue
          signals={signals}
          decisions={signalDecisions}
          records={signalRecords}
          canMutate={mutable}
          onDecide={(id, decision, record) => {
            if (exchange.requests.some((request) => request.id === id)) exchange.decideRequest(id, decision);
            const signal = signals.find((item) => item.id === id);
            // REG-02/REG-03: only published requirements reach a case, pinned at the version
            // they hold today. A later revision flags the case rather than changing it.
            const pinned = requirements.
            filter(
              (requirement) =>
              requirement.status === 'current' && (!requirement.sectorCode || requirement.sectorCode === signal?.sectorCode)
            ).
            map((requirement) => ({ id: requirement.id, version: requirement.version, title: requirement.title }));

            const opportunityId = decideSignal(
              id,
              decision,
              record,
              signal ? { title: signal.summary.split('—')[0].trim(), origin: signal.origin, sectorCode: signal.sectorCode, pinned } : undefined
            );

            const confidence = record.confidence ? ` (${record.confidence.toLowerCase()} confidence)` : '';
            logEvent(
              decision === 'qualified' ?
              `Qualified a signal from ${signal?.origin ?? 'an unknown origin'}${confidence} — opportunity ${opportunityId} created with ${pinned.length} requirement${pinned.length === 1 ? '' : 's'} pinned. "${record.reason}"` :
              `Rejected a signal from ${signal?.origin ?? 'an unknown origin'} — "${record.reason}"`,
              'opportunities',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
