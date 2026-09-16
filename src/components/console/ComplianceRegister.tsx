import React from 'react';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import {
  requirementCategoryLabels,
  type RegulatoryRequirement,
  type RequirementCategory,
  type RequirementStatus } from
'../../data/regulations';
import { opportunities } from '../../data/opportunities';
import { sectorLabel } from '../../lib/marketplaceLookups';

export interface ComplianceFilterState {
  search: string;
  category: RequirementCategory | 'all';
  status: RequirementStatus | 'all';
}

interface OverrideState {
  status: RequirementStatus;
  reviewDue: boolean;
}

interface ComplianceRegisterProps {
  requirements: RegulatoryRequirement[];
  total: number;
  filters: ComplianceFilterState;
  onFilterChange: (filters: ComplianceFilterState) => void;
  overrides: Record<string, OverrideState>;
  onAction: (id: string, next: OverrideState) => void;
}

const statusStyles: Record<RequirementStatus, string> = {
  current: 'bg-emerald-50 text-emerald-700',
  'under-review': 'bg-amber-50 text-amber-700',
  superseded: 'bg-gray-100 text-gray-500'
};

const statusLabels: Record<RequirementStatus, string> = {
  current: 'Current',
  'under-review': 'Under review',
  superseded: 'Superseded'
};

function affectedOpportunities(sectorCode?: string): string {
  if (!sectorCode) return `${opportunities.length} · all sectors`;
  const count = opportunities.filter((opportunity) => opportunity.sectorCode === sectorCode).length;
  return `${count} · ${sectorLabel(sectorCode)}`;
}

export function ComplianceRegister({
  requirements,
  total,
  filters,
  onFilterChange,
  overrides,
  onAction
}: ComplianceRegisterProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold text-gray-900">Regulatory requirements register</h2>
          <p className="text-[12.5px] text-gray-400">{requirements.length} of {total} shown</p>
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
              placeholder="Search requirements..."
              className="w-56 rounded-full border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:border-gray-300 focus:outline-none" />

          </div>

          <div className="relative">
            <select
              value={filters.category}
              onChange={(event) =>
              onFilterChange({ ...filters, category: event.target.value as ComplianceFilterState['category'] })
              }
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All categories</option>
              {Object.entries(requirementCategoryLabels).map(([value, label]) =>
              <option key={value} value={value}>{label}</option>
              )}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>

          <div className="relative">
            <select
              value={filters.status}
              onChange={(event) =>
              onFilterChange({ ...filters, status: event.target.value as ComplianceFilterState['status'] })
              }
              className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-gray-300 focus:outline-none">

              <option value="all">All statuses</option>
              <option value="current">Current</option>
              <option value="under-review">Under review</option>
              <option value="superseded">Superseded</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
              aria-hidden="true" />

          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-[0.06em] text-gray-400">
              <th className="py-2.5 pr-3 font-medium">Requirement</th>
              <th className="py-2.5 pr-3 font-medium">Category</th>
              <th className="py-2.5 pr-3 font-medium">Authority</th>
              <th className="py-2.5 pr-3 font-medium">Last reviewed</th>
              <th className="py-2.5 pr-3 font-medium">Affects</th>
              <th className="py-2.5 pr-3 font-medium">Status</th>
              <th className="py-2.5 pl-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requirements.map((requirement) => {
              const state = overrides[requirement.id] ?? {
                status: requirement.status,
                reviewDue: requirement.reviewDue
              };

              return (
                <tr key={requirement.id} className="border-b border-gray-50 last:border-0">
                  <td className="max-w-[260px] py-3 pr-3">
                    <p className="font-medium text-gray-900">{requirement.title}</p>
                    <p className="font-mono text-[10.5px] text-gray-400">{requirement.id}</p>
                  </td>
                  <td className="py-3 pr-3 text-gray-500">{requirementCategoryLabels[requirement.category]}</td>
                  <td className="py-3 pr-3 text-gray-500">{requirement.authority}</td>
                  <td className="py-3 pr-3 text-gray-500">{requirement.lastReviewedOn}</td>
                  <td className="py-3 pr-3 font-mono text-[11.5px] text-gray-400">
                    {affectedOpportunities(requirement.sectorCode)}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${statusStyles[state.status]}`}>
                        {statusLabels[state.status]}
                      </span>
                      {state.reviewDue &&
                      <span className="rounded-full bg-rose-50 px-2 py-1 text-[10.5px] font-medium text-rose-600">
                          Review due
                        </span>
                      }
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    {state.status === 'superseded' ?
                    <span className="text-[11.5px] text-gray-300">No action</span> :
                    state.reviewDue || state.status === 'under-review' ?
                    <button
                      type="button"
                      onClick={() => onAction(requirement.id, { status: 'current', reviewDue: false })}
                      className="rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        Mark reviewed
                      </button> :

                    <button
                      type="button"
                      onClick={() => onAction(requirement.id, { status: 'under-review', reviewDue: true })}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        Flag for review
                      </button>
                    }
                  </td>
                </tr>);

            })}
          </tbody>
        </table>

        {requirements.length === 0 &&
        <p className="py-10 text-center text-[13px] text-gray-400">No requirements match these filters.</p>
        }
      </div>
    </div>);

}
