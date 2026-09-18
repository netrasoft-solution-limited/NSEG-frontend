import React, { useState } from 'react';
import { requirementCategoryLabels, targetMarkets, type RegulatoryRequirement, type RequirementCategory } from '../../data/regulations';
import { useRegulatoryRegister } from '../../lib/regulatoryRegister';
import { DataTable, Tag } from './WorkspaceUI';

const categoryTone = (category: RequirementCategory) =>
category === 'statutory' ? 'gold' : category === 'buyer-standard' ? 'neutral' : 'green';

function marketsOf(requirement: RegulatoryRequirement): string {
  const markets = requirement.appliesTo.markets;
  if (!markets?.length) return 'All markets';
  return markets.map((id) => targetMarkets.find((market) => market.id === id)?.label ?? id).join(', ');
}

/** The published requirements register (REG-01), read-only. Statutory duties, professional and
 * fiscal rules and buyer standards stay labelled apart. Superseded versions are not listed. */
export function RequirementsRegisterTable() {
  const { requirements } = useRegulatoryRegister();
  const [category, setCategory] = useState<RequirementCategory | 'all'>('all');
  const live = requirements.filter((item) => item.status !== 'superseded');
  const shown = category === 'all' ? live : live.filter((item) => item.category === category);
  const categories = Object.keys(requirementCategoryLabels) as RequirementCategory[];

  return (
    <>
      <div role="group" aria-label="Filter by type" className="mb-4 flex flex-wrap gap-2">
        {(['all', ...categories] as const).map((id) =>
        <button
          key={id}
          type="button"
          aria-pressed={category === id}
          onClick={() => setCategory(id)}
          className={`min-h-[40px] rounded-full px-4 text-[13px] font-medium ring-1 ring-inset transition-colors ${
          category === id ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-700 ring-gray-200 hover:ring-gray-400'}`
          }>

            {id === 'all' ? `All (${live.length})` : requirementCategoryLabels[id]}
          </button>
        )}
      </div>

      <DataTable label="Requirements register" head={['Requirement', 'Owning institution', 'Type', 'Market', 'Currency']}>
        {shown.map((item) =>
        <tr key={item.id} className="align-top">
            <td className="px-4 py-3.5">
              <p className="text-[14px] font-semibold text-gray-900">{item.title}</p>
              <p className="mt-0.5 font-mono text-[11.5px] text-gray-500">
                {item.id} · v{item.version}
              </p>
            </td>
            <td className="px-4 py-3.5 text-[13px] text-gray-700">{item.authority}</td>
            <td className="px-4 py-3.5">
              <Tag tone={categoryTone(item.category)}>{requirementCategoryLabels[item.category]}</Tag>
            </td>
            <td className="px-4 py-3.5 text-[13px] text-gray-700">{marketsOf(item)}</td>
            <td className="px-4 py-3.5">
              {item.reviewDue ?
            <Tag tone="clay">Review overdue</Tag> :
            item.status === 'under-review' ?
            <Tag tone="gold">Under review</Tag> :

            <Tag tone="ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                  Current
                </Tag>
            }
              <p className="mt-1 whitespace-nowrap text-[12px] text-gray-500">Next review {item.nextReviewOn}</p>
            </td>
          </tr>
        )}
      </DataTable>

      <p className="mt-4 text-[12.5px] leading-relaxed text-gray-600">
        Every record carries its institution, source, version, sign-off and review date. Records missing any of them are
        not published.
      </p>
    </>);

}
