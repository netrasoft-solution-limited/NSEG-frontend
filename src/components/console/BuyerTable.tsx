import React from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import type { Buyer } from '../../data/buyers';
import { buyerTiers } from '../../data/buyerTiers';
import { initialsOf } from '../../lib/initials';
import type { BuyerFilterState } from '../../lib/buyerFilters';

interface BuyerTableProps {
  buyers: Buyer[];
  total: number;
  filters: BuyerFilterState;
  onChange: (filters: BuyerFilterState) => void;
}

function TierPill({ buyer }: {buyer: Buyer;}) {
  const tier = buyerTiers.find((item) => item.id === buyer.tier);
  const styles =
  buyer.tier === 'payment-verified' ?
  'bg-amber-50 text-amber-700' :
  buyer.tier === 'registry-verified' ?
  'bg-emerald-50 text-emerald-700' :
  'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium ${styles}`}>
      {tier?.badge ?? buyer.tier}
    </span>);

}

export function BuyerTable({ buyers, total, filters, onChange }: BuyerTableProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">All buyers</h2>
          <p className="text-[12.5px] text-gray-400">
            {buyers.length} of {total} shown
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
              value={filters.tier}
              onChange={(event) =>
              onChange({ ...filters, tier: event.target.value as BuyerFilterState['tier'] })
              }
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All tiers</option>
              {buyerTiers.map((tier) =>
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
        <table className="w-full min-w-[700px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-[0.06em] text-gray-400">
              <th className="py-2.5 pr-3 font-medium">Buyer</th>
              <th className="py-2.5 pr-3 font-medium">Email</th>
              <th className="py-2.5 pr-3 font-medium">Region</th>
              <th className="py-2.5 pr-3 font-medium">Registered</th>
              <th className="py-2.5 pr-3 font-medium">RFPs posted</th>
              <th className="py-2.5 pr-3 font-medium">Tier</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map((buyer) =>
            <tr key={buyer.id} className="border-b border-gray-50 last:border-0">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {initialsOf(buyer.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{buyer.name}</p>
                      <p className="truncate font-mono text-[10.5px] text-gray-400">{buyer.referenceId}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 text-gray-500">{buyer.email}</td>
                <td className="py-3 pr-3 text-gray-500">{buyer.region}</td>
                <td className="py-3 pr-3 text-gray-500">{buyer.registeredOn}</td>
                <td className="py-3 pr-3 text-gray-500">{buyer.opportunitiesPosted}</td>
                <td className="py-3 pr-3">
                  <TierPill buyer={buyer} />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {buyers.length === 0 &&
        <p className="py-10 text-center text-[13px] text-gray-400">No buyers match these filters.</p>
        }
      </div>
    </div>);

}
