import React, { useState } from 'react';
import { BanIcon, DownloadIcon, ShieldAlertIcon, UserCheckIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ActorTable } from '../components/console/ActorTable';
import { VerificationQueue, type VerificationDecision } from '../components/console/VerificationQueue';
import { useAccounts } from '../lib/accounts';
import { filterActors, type ActorFilterState } from '../lib/actorFilters';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';
import { computeReadinessScore } from '../lib/readinessScore';

const emptyFilters: ActorFilterState = { search: '', status: 'all', tier: 'all' };

export function ConsoleExporters() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [filters, setFilters] = useState<ActorFilterState>(emptyFilters);
  const [verificationDecisions, setVerificationDecisions] = useState<Record<string, VerificationDecision>>({});
  const [suspensionOverrides, setSuspensionOverrides] = useState<Record<string, boolean>>({});
  const accounts = useAccounts();
  const actors = accounts.exporters;

  const isSuspended = (actor: (typeof accounts.exporters)[number]) => suspensionOverrides[actor.id] ?? actor.suspended;
  const filtered = filterActors(actors, filters).map((actor) => ({ ...actor, suspended: isSuspended(actor) }));
  const verifiedCount = actors.filter((actor) => actor.tier !== 'registered').length;
  const newCount = actors.filter((actor) => actor.isNew).length;
  const suspendedCount = actors.filter((actor) => isSuspended(actor)).length;
  const pendingVerificationCount = actors.filter(
    (actor) => actor.verificationQueue !== 'none' && !verificationDecisions[actor.id]
  ).length;

  const handleExport = () => {
    downloadCsv(
      'nseg-exporters.csv',
      filtered.map((actor) => ({
        name: actor.name,
        email: actor.email,
        natepId: actor.natepId,
        registeredOn: actor.registeredOn,
        lastActive: actor.lastActiveDaysAgo === 0 ? 'Today' : `${actor.lastActiveDaysAgo} days ago`,
        matches: actor.matchCount,
        tier: actor.tier,
        track: actor.track,
        diagnosticScore: computeReadinessScore(actor.diagnostic),
        suspended: actor.suspended ? 'yes' : 'no'
      }))
    );
    logEvent(`Exported the exporter registry (${filtered.length} rows)`, 'exporters', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Exporters" onExport={handleExport}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">Exporters</h1>
          <p className="mt-1 text-[13.5px] text-gray-500">Manage registered exporters, activity and verification status.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

          <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
          Export exporters
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={UsersIcon}
          label="Total exporters"
          value={actors.length.toLocaleString()}
          delta="+12.4%"
          positive
          accent="gate" />

        <StatCard
          icon={UserCheckIcon}
          label="Identity verified or above"
          value={verifiedCount.toLocaleString()}
          delta="+8.7%"
          positive
          accent="sky" />

        <StatCard
          icon={UserPlusIcon}
          label="New this week"
          value={newCount.toLocaleString()}
          delta="+8.7%"
          positive
          accent="gold" />

        <StatCard
          icon={ShieldAlertIcon}
          label="Pending verification"
          value={pendingVerificationCount.toString()}
          delta="Needs review"
          positive={false}
          accent="rose" />

        <StatCard
          icon={BanIcon}
          label="Suspended"
          value={suspendedCount.toLocaleString()}
          delta="-4.4%"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <VerificationQueue
          entities={actors.map((actor) => ({
            ...actor,
            referenceId: actor.natepId,
            // Keep a decided registration visible as resolved after its queue clears.
            verificationQueue: verificationDecisions[actor.id] && actor.verificationQueue === 'none' ? 'pending' : actor.verificationQueue
          }))}
          decisions={verificationDecisions}
          canMutate={mutable}
          onDecide={(id, decision) => {
            setVerificationDecisions((current) => ({ ...current, [id]: decision }));
            if (accounts.isNewAccount(id)) {
              // New registrations: approval verifies what they submitted; rejection never locks them out.
              accounts.decideExporterVerification(id, decision);
            } else if (decision === 'rejected') {
              setSuspensionOverrides((current) => ({ ...current, [id]: true }));
            }
            const actor = actors.find((item) => item.id === id);
            logEvent(
              `${decision === 'approved' ? 'Verified' : 'Rejected'} ${actor?.name ?? id}'s exporter account`,
              'exporters',
              profile.name
            );
          }} />

      </div>

      <div className="mt-6">
        <ActorTable
          actors={filtered}
          total={actors.length}
          filters={filters}
          onChange={setFilters}
          canMutate={mutable}
          onSuspendToggle={(id, nextSuspended) => {
            setSuspensionOverrides((current) => ({ ...current, [id]: nextSuspended }));
            const actor = actors.find((item) => item.id === id);
            logEvent(
              `${nextSuspended ? 'Suspended' : 'Reinstated'} ${actor?.name ?? id}'s exporter account`,
              'exporters',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
