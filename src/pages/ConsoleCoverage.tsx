import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, InfoIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { settingsTabs } from '../components/console/consoleTabs';
import { DataTable, Tag } from '../components/workspace/WorkspaceUI';
import { moduleCoverage } from '../data/moduleCoverage';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

/** What the console covers, against the requirement each capability answers. The sidebar used to
 * carry this evidence by having one entry per module; it now has seven sections, so the mapping
 * is stated here instead — and stays checkable, because each row names the file that cites it. */
export function ConsoleCoverage() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();

  const handleExport = () => {
    downloadCsv(
      'nseg-module-coverage.csv',
      moduleCoverage.map((entry) => ({
        capability: entry.capability,
        requirements: entry.requirements.join('; '),
        location: entry.location,
        implementedIn: entry.source
      }))
    );
    logEvent(`Exported the module coverage table (${moduleCoverage.length} rows)`, 'settings', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Settings · Module coverage" onExport={handleExport} tabs={settingsTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">
          Module coverage
        </h1>
        <p className="mt-1.5 max-w-3xl text-[14.5px] text-gray-600">
          Every specified capability, the requirement it answers, and where it lives in the console now that the
          sections are grouped. Each row names the file carrying that citation, so the claim can be checked rather
          than taken.
        </p>
      </div>

      <div className="mt-6">
        <DataTable label="Module coverage" head={['Capability', 'Requirement', 'Where it lives', 'Implemented in']}>
          {moduleCoverage.map((entry) =>
          <tr key={entry.capability} className="align-top">
              <td className="px-4 py-3.5">
                <p className="text-[14px] font-semibold text-gray-900">{entry.capability}</p>
              </td>
              <td className="px-4 py-3.5">
                <span className="flex flex-wrap gap-1.5">
                  {entry.requirements.map((requirement) =>
                <Tag key={requirement} tone="gold">
                      {requirement}
                    </Tag>
                )}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <Link
                to={entry.to}
                className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-gray-900 underline-offset-4 hover:underline">

                  {entry.location}
                  <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </td>
              <td className="px-4 py-3.5 font-mono text-[11.5px] text-gray-600">{entry.source}</td>
            </tr>
          )}
        </DataTable>
      </div>

      <p className="mt-6 flex gap-2 text-[12.5px] leading-relaxed text-gray-600">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Requirement ids are quoted from the BRD, the PRD and the module specifications as cited in the implementing
        code. This is a working prototype: the capability is built and demonstrable, but nothing here is a statement of
        production readiness.
      </p>
    </ConsoleLayout>);

}
