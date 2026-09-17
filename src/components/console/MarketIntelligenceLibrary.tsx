import React from 'react';
import { ChevronDownIcon, GlobeIcon, SearchIcon } from 'lucide-react';
import type { IntelligenceStatus, MarketIntelligenceBrief } from '../../data/marketIntelligence';
import { sectorLabel, modeLabel } from '../../lib/marketplaceLookups';
import type { MarketIntelligenceFilterState } from '../../lib/marketIntelligenceFilters';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface MarketIntelligenceLibraryProps {
  briefs: MarketIntelligenceBrief[];
  total: number;
  countries: string[];
  sectorCodes: string[];
  filters: MarketIntelligenceFilterState;
  onFilterChange: (filters: MarketIntelligenceFilterState) => void;
  statuses: Record<string, IntelligenceStatus>;
  onPublish: (id: string) => void;
  onFlagForReview: (id: string) => void;
  canMutate: boolean;
}

const statusStyles: Record<IntelligenceStatus, string> = {
  draft: 'bg-gray-100 text-gray-500',
  'under-review': 'bg-amber-50 text-amber-700',
  published: 'bg-emerald-50 text-emerald-700'
};

const statusLabels: Record<IntelligenceStatus, string> = {
  draft: 'Draft',
  'under-review': 'Under review',
  published: 'Published'
};

export function MarketIntelligenceLibrary({
  briefs,
  total,
  countries,
  sectorCodes,
  filters,
  onFilterChange,
  statuses,
  onPublish,
  onFlagForReview,
  canMutate
}: MarketIntelligenceLibraryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">Market access briefs</h2>
          <p className="text-[12.5px] text-gray-400">{briefs.length} of {total} shown</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

            <input
              type="search"
              value={filters.search}
              onChange={(event) => onFilterChange({ ...filters, search: event.target.value })}
              placeholder="Search briefs..."
              className="w-52 rounded-full border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none" />

          </div>

          <div className="relative">
            <select
              value={filters.country}
              onChange={(event) => onFilterChange({ ...filters, country: event.target.value })}
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All countries</option>
              {countries.map((country) =>
              <option key={country} value={country}>{country}</option>
              )}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>

          <div className="relative">
            <select
              value={filters.sectorCode}
              onChange={(event) => onFilterChange({ ...filters, sectorCode: event.target.value })}
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All sectors</option>
              {sectorCodes.map((code) =>
              <option key={code} value={code}>{sectorLabel(code)}</option>
              )}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {briefs.map((brief) => {
          const status = statuses[brief.id] ?? brief.status;

          return (
            <li key={brief.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <GlobeIcon className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                    <p className="font-medium text-gray-900">{brief.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusStyles[status]}`}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-gray-400">
                    {sectorLabel(brief.sectorCode)} · {brief.modes.map(modeLabel).join(', ')} · Updated{' '}
                    {brief.lastUpdatedOn}
                  </p>
                  <p className="mt-1.5 text-[13px] text-gray-600">{brief.summary}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {brief.topics.map((topic) =>
                    <span key={topic} className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] text-gray-500">
                        {topic}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!canMutate && <AuditOnlyBadge />}
                  {canMutate && status !== 'published' &&
                  <button
                    type="button"
                    onClick={() => onPublish(brief.id)}
                    className="rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                      Publish
                    </button>
                  }
                  {canMutate && status === 'published' &&
                  <button
                    type="button"
                    onClick={() => onFlagForReview(brief.id)}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                      Flag for review
                    </button>
                  }
                </div>
              </div>
            </li>);

        })}
        {briefs.length === 0 &&
        <p className="py-10 text-center text-[13px] text-gray-400">No briefs match these filters.</p>
        }
      </ul>
    </div>);

}
