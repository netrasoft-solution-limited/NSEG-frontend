import React from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, FileCheck2Icon, InfoIcon, RouteIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { opportunityTabs } from '../components/console/consoleTabs';
import { StatCard } from '../components/console/StatCard';
import { DataTable, EmptyState, Tag } from '../components/workspace/WorkspaceUI';
import { opportunities } from '../data/opportunities';
import { shortlists } from '../data/shortlists';
import { downloadCsv } from '../lib/exportCsv';
import { modeLabel, sectorLabel, stageLabel } from '../lib/marketplaceLookups';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { useCaseDecisions } from '../lib/caseDecisions';

const stageTone = (stage: string) => stage === 'consented' ? 'ok' : stage === 'matched' ? 'green' : 'gold';

/** One canonical record per qualified requirement, carried unchanged from qualification through
 * to the verified outcome. Qualifying a signal is what creates one, and it carries the exact
 * versions of the rules that were in force at that moment (REG-02). */
export function ConsoleOpportunityRecords() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const { qualified } = useCaseDecisions();

  const seeded = opportunities.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    detail: `${sectorLabel(opportunity.sectorCode)} · ${modeLabel(opportunity.mode)}`,
    market: opportunity.buyerRegion,
    value: opportunity.indicativeValue ?
    `${opportunity.indicativeValue.unit} ${opportunity.indicativeValue.min.toLocaleString()}–${opportunity.indicativeValue.max.toLocaleString()}` :
    'Not stated',
    pinned: opportunity.criteria.length,
    criteriaVersion: 1,
    stage: opportunity.stage as string,
    isNew: false
  }));

  const created = qualified.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.title,
    detail: `${sectorLabel(opportunity.sectorCode)} · qualified ${opportunity.qualifiedOn}`,
    market: opportunity.origin,
    value: 'From the signal',
    pinned: opportunity.pinned.length,
    criteriaVersion: opportunity.criteriaVersion,
    stage: 'qualified',
    isNew: true
  }));

  const rows = [...created, ...seeded];
  const matching = rows.filter((row) => row.stage === 'matched').length;
  const shortlisted = shortlists.length;

  const handleExport = () => {
    downloadCsv(
      'nseg-opportunities.csv',
      rows.map((row) => ({
        opportunity: row.id,
        title: row.title,
        market: row.market,
        value: row.value,
        rulesPinned: row.pinned,
        criteriaVersion: row.criteriaVersion,
        stage: row.stage
      }))
    );
    logEvent(`Exported the opportunity register (${rows.length} rows)`, 'opportunities', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Opportunities · Records" onExport={handleExport} tabs={opportunityTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
          Opportunity records
        </h1>
        <p className="mt-1.5 max-w-3xl text-[14.5px] text-gray-600">
          One record per qualified requirement, carried unchanged from qualification to a verified outcome. Each
          carries the exact versions of the rules in force when it was qualified.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BriefcaseIcon} label="Open records" value={rows.length.toString()} delta="Qualified demand" positive accent="sky" />
        <StatCard icon={RouteIcon} label="Ready to match" value={matching.toString()} delta="Criteria published" positive accent="gate" />
        <StatCard icon={FileCheck2Icon} label="Shortlists drawn" value={shortlisted.toString()} delta="Awaiting approval" positive accent="gold" />
        <StatCard
          icon={BriefcaseIcon}
          label="Created this session"
          value={created.length.toString()}
          delta={created.length ? 'From the queue' : 'None yet'}
          positive
          accent="rose" />

      </div>

      <div className="mt-6">
        {rows.length === 0 ?
        <EmptyState title="No opportunities yet">
            Qualifying a demand signal creates one canonical record, carried through to outcome.
          </EmptyState> :

        <DataTable label="Opportunity records" head={['Opportunity', 'Market', 'Value', 'Rules pinned', 'Stage']}>
            {rows.map((row) =>
          <tr key={row.id} className="align-top">
                <td className="px-4 py-3.5">
                  <p className="text-[14px] font-semibold text-gray-900">{row.title}</p>
                  <p className="mt-0.5 font-mono text-[11.5px] text-gray-500">
                    {row.id.toUpperCase()} · criteria v{row.criteriaVersion}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-[13px] text-gray-700">
                  {row.market}
                  <span className="block text-[12px] text-gray-500">{row.detail}</span>
                </td>
                <td className="px-4 py-3.5 text-[13px] font-medium text-gray-800">{row.value}</td>
                <td className="px-4 py-3.5 text-[13px] text-gray-700">
                  {row.pinned} requirement{row.pinned === 1 ? '' : 's'}
                </td>
                <td className="px-4 py-3.5">
                  <Tag tone={row.isNew ? 'gold' : stageTone(row.stage)}>{row.isNew ? 'Qualified' : stageLabel(row.stage as never)}</Tag>
                </td>
              </tr>
          )}
          </DataTable>
        }
      </div>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Records created in this session come from the{' '}
        <Link to="/console/opportunities" className="font-medium text-gray-900 underline underline-offset-2">
          qualification queue
        </Link>
        . Seeded records carry their published criteria instead.
      </p>
    </ConsoleLayout>);

}
