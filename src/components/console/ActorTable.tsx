import React, { useState } from 'react';
import { ChevronDownIcon, MoreVerticalIcon, SearchIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import { trustTiers } from '../../data/trustTiers';
import { formatLastActive, type ActorFilterState } from '../../lib/actorFilters';
import { initialsOf } from '../../lib/initials';

interface ActorTableProps {
  actors: Actor[];
  total: number;
  filters: ActorFilterState;
  onChange: (filters: ActorFilterState) => void;
}

function StatusPill({ actor }: {actor: Actor;}) {
  if (actor.suspended) {
    return (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-[11.5px] font-medium text-rose-700">
        Suspended
      </span>);

  }
  if (actor.isNew) {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11.5px] font-medium text-sky-700">
        New
      </span>);

  }
  const tier = trustTiers.find((item) => item.id === actor.tier);
  const styles =
  actor.tier === 'top-rated' ?
  'bg-amber-50 text-amber-700' :
  actor.tier === 'verified' ?
  'bg-emerald-50 text-emerald-700' :
  'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ${styles}`}>
      {tier?.badge ?? actor.tier}
    </span>);

}

export function ActorTable({ actors, total, filters, onChange }: ActorTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">All exporters</h2>
          <p className="text-[12.5px] text-gray-400">
            {actors.length} of {total} shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

            <input
              type="search"
              value={filters.search}
              onChange={(event) => onChange({ ...filters, search: event.target.value })}
              placeholder="Search by name or email..."
              className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none" />

          </div>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(event) =>
              onChange({ ...filters, status: event.target.value as ActorFilterState['status'] })
              }
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>

          <div className="relative">
            <select
              value={filters.tier}
              onChange={(event) =>
              onChange({ ...filters, tier: event.target.value as ActorFilterState['tier'] })
              }
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All tiers</option>
              {trustTiers.map((tier) =>
              <option key={tier.id} value={tier.id}>{tier.badge}</option>
              )}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-[0.06em] text-gray-400">
              <th className="py-2.5 pr-3 font-medium">Exporter</th>
              <th className="py-2.5 pr-3 font-medium">Email</th>
              <th className="py-2.5 pr-3 font-medium">Registered</th>
              <th className="py-2.5 pr-3 font-medium">Last active</th>
              <th className="py-2.5 pr-3 font-medium">Matches</th>
              <th className="py-2.5 pr-3 font-medium">Status</th>
              <th className="py-2.5 pl-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {actors.map((actor) =>
            <tr key={actor.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {initialsOf(actor.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{actor.name}</p>
                      <p className="truncate font-mono text-[10.5px] text-gray-400">{actor.natepId}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-gray-500">{actor.email}</td>
                <td className="py-3 pr-3 text-gray-500">{actor.registeredOn}</td>
                <td className="py-3 pr-3 text-gray-500">{formatLastActive(actor.lastActiveDaysAgo)}</td>
                <td className="py-3 pr-3 text-gray-500">{actor.matchCount}</td>
                <td className="py-3 pr-3">
                  <StatusPill actor={actor} />
                </td>
                <td className="py-3 pl-3 text-right">
                  <div className="relative inline-block">
                    <button
                    type="button"
                    onClick={() => setOpenMenuId((current) => current === actor.id ? null : actor.id)}
                    aria-label="Row actions"
                    aria-expanded={openMenuId === actor.id}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors duration-150 ease-out hover:bg-gray-50 hover:text-gray-700">

                      <MoreVerticalIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {openMenuId === actor.id &&
                  <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-gray-100 bg-white p-1.5 text-left shadow-lg">
                        {['View profile', 'Message exporter', 'Suspend account'].map((label) =>
                    <span
                      key={label}
                      className="block cursor-not-allowed rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-300">

                            {label}
                          </span>
                    )}
                        <p className="border-t border-gray-50 px-2.5 pt-1.5 text-[10.5px] text-gray-300">
                          Actions require sign-in
                        </p>
                      </div>
                  }
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {actors.length === 0 &&
        <p className="py-10 text-center text-[13px] text-gray-400">No exporters match these filters.</p>
        }
      </div>
    </div>);

}
