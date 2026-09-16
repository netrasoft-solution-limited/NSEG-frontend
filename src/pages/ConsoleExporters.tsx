import React, { useState } from 'react';
import { BanIcon, DownloadIcon, UserCheckIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { ActorTable } from '../components/console/ActorTable';
import { actors } from '../data/actors';
import { filterActors, type ActorFilterState } from '../lib/actorFilters';
import { downloadCsv } from '../lib/exportCsv';

const emptyFilters: ActorFilterState = { search: '', status: 'all', tier: 'all' };

export function ConsoleExporters() {
  const [filters, setFilters] = useState<ActorFilterState>(emptyFilters);

  const filtered = filterActors(actors, filters);
  const verifiedCount = actors.filter((actor) => actor.tier !== 'registered').length;
  const newCount = actors.filter((actor) => actor.isNew).length;
  const suspendedCount = actors.filter((actor) => actor.suspended).length;

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
        suspended: actor.suspended ? 'yes' : 'no'
      }))
    );
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Total exporters"
          value={actors.length.toLocaleString()}
          delta="+12.4%"
          positive
          accent="gate" />

        <StatCard
          icon={UserCheckIcon}
          label="Verified exporters"
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
          icon={BanIcon}
          label="Suspended"
          value={suspendedCount.toLocaleString()}
          delta="-4.4%"
          positive={false}
          accent="rose" />

      </div>

      <div className="mt-6">
        <ActorTable actors={filtered} total={actors.length} filters={filters} onChange={setFilters} />
      </div>
    </ConsoleLayout>);

}
