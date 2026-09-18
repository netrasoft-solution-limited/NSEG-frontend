import React from 'react';
import { ArchiveIcon, BookMarkedIcon, LayersIcon, TagIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { requirementTabs } from '../components/console/consoleTabs';
import { StatCard } from '../components/console/StatCard';
import { TaxonomyRegistry } from '../components/console/TaxonomyRegistry';
import { sectors } from '../data/sectors';
import { supplyModes } from '../data/observatory';
import { trustTiers } from '../data/trustTiers';
import { buyerTiers } from '../data/buyerTiers';
import { deprecatedCodes, taxonomyVersions } from '../data/taxonomies';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';

const totalActiveCodes = sectors.length + supplyModes.length + trustTiers.length + buyerTiers.length;

export function ConsoleTaxonomies() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();

  const handleExport = () => {
    downloadCsv(
      'nseg-taxonomies.csv',
      taxonomyVersions.map((taxonomy) => ({
        category: taxonomy.category,
        label: taxonomy.label,
        standard: taxonomy.standard,
        version: taxonomy.version,
        lastUpdatedOn: taxonomy.lastUpdatedOn
      }))
    );
    logEvent(`Exported the taxonomy registry (${taxonomyVersions.length} tables)`, 'taxonomies', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Requirements · Reference data" onExport={handleExport} tabs={requirementTabs}>
      <div>
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.02em] text-gray-900 sm:text-[34px]">Taxonomies</h1>
        <p className="mt-1.5 text-[14.5px] text-gray-600">
          The shared master data every portal draws its dropdowns from — one source of truth, versioned,
          never silently deleted.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={LayersIcon}
          label="Controlled tables"
          value={taxonomyVersions.length.toString()}
          delta="Shared foundation"
          positive
          accent="sky" />

        <StatCard
          icon={TagIcon}
          label="Active codes"
          value={totalActiveCodes.toString()}
          delta="In use"
          positive
          accent="gate" />

        <StatCard
          icon={ArchiveIcon}
          label="Deprecated codes"
          value={deprecatedCodes.length.toString()}
          delta="Historical only"
          positive
          accent="gold" />

        <StatCard
          icon={BookMarkedIcon}
          label="Standards referenced"
          value={new Set(taxonomyVersions.map((item) => item.standard)).size.toString()}
          delta="External + internal"
          positive
          accent="rose" />

      </div>

      <div className="mt-6">
        <TaxonomyRegistry />
      </div>
    </ConsoleLayout>);

}
