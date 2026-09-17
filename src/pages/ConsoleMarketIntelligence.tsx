import React, { useState } from 'react';
import { BookOpenIcon, CheckCircleIcon, GlobeIcon, HistoryIcon } from 'lucide-react';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { StatCard } from '../components/console/StatCard';
import { MarketIntelligenceLibrary } from '../components/console/MarketIntelligenceLibrary';
import { marketIntelligenceBriefs, type IntelligenceStatus } from '../data/marketIntelligence';
import { filterBriefs, type MarketIntelligenceFilterState } from '../lib/marketIntelligenceFilters';
import { downloadCsv } from '../lib/exportCsv';
import { useOfficerProfile } from '../lib/officerProfile';
import { useAuditLog } from '../lib/auditLog';
import { canMutate } from '../lib/permissions';

const emptyFilters: MarketIntelligenceFilterState = { search: '', country: 'all', sectorCode: 'all' };
const countries = Array.from(new Set(marketIntelligenceBriefs.map((brief) => brief.targetCountry))).sort();
const sectorCodes = Array.from(new Set(marketIntelligenceBriefs.map((brief) => brief.sectorCode)));

export function ConsoleMarketIntelligence() {
  const { profile } = useOfficerProfile();
  const { logEvent } = useAuditLog();
  const mutable = canMutate(profile.role);
  const [filters, setFilters] = useState<MarketIntelligenceFilterState>(emptyFilters);
  const [statuses, setStatuses] = useState<Record<string, IntelligenceStatus>>({});

  const statusOf = (id: string, fallback: IntelligenceStatus) => statuses[id] ?? fallback;

  const filtered = filterBriefs(marketIntelligenceBriefs, filters);
  const publishedCount = marketIntelligenceBriefs.filter(
    (brief) => statusOf(brief.id, brief.status) === 'published'
  ).length;
  const underReviewCount = marketIntelligenceBriefs.filter(
    (brief) => statusOf(brief.id, brief.status) === 'under-review'
  ).length;
  const draftCount = marketIntelligenceBriefs.filter((brief) => statusOf(brief.id, brief.status) === 'draft').length;
  const countryCount = countries.length;

  const handleExport = () => {
    downloadCsv(
      'nseg-market-intelligence.csv',
      marketIntelligenceBriefs.map((brief) => ({
        title: brief.title,
        targetCountry: brief.targetCountry,
        sectorCode: brief.sectorCode,
        modes: brief.modes.join('; '),
        lastUpdatedOn: brief.lastUpdatedOn,
        status: statusOf(brief.id, brief.status)
      }))
    );
    logEvent(`Exported the market intelligence library (${marketIntelligenceBriefs.length} rows)`, 'market-intelligence', profile.name);
  };

  return (
    <ConsoleLayout breadcrumb="Market intelligence" onExport={handleExport}>
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.01em] text-gray-900">
          Market intelligence
        </h1>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Destination-market trade rules by country, sector, and mode of supply — reviewed and
          published before an exporter ever sees them.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpenIcon}
          label="Total briefs"
          value={marketIntelligenceBriefs.length.toString()}
          delta="Library"
          positive
          accent="sky" />

        <StatCard
          icon={CheckCircleIcon}
          label="Published"
          value={publishedCount.toString()}
          delta="Library"
          positive
          accent="gate" />

        <StatCard
          icon={HistoryIcon}
          label="Under review / draft"
          value={(underReviewCount + draftCount).toString()}
          delta="Needs attention"
          positive={false}
          accent="gold" />

        <StatCard
          icon={GlobeIcon}
          label="Countries covered"
          value={countryCount.toString()}
          delta="Destination markets"
          positive
          accent="rose" />

      </div>

      <div className="mt-6">
        <MarketIntelligenceLibrary
          briefs={filtered}
          total={marketIntelligenceBriefs.length}
          countries={countries}
          sectorCodes={sectorCodes}
          filters={filters}
          onFilterChange={setFilters}
          statuses={statuses}
          canMutate={mutable}
          onPublish={(id) => {
            setStatuses((current) => ({ ...current, [id]: 'published' }));
            const brief = marketIntelligenceBriefs.find((item) => item.id === id);
            logEvent(`Published the market access brief "${brief?.title ?? id}"`, 'market-intelligence', profile.name);
          }}
          onFlagForReview={(id) => {
            setStatuses((current) => ({ ...current, [id]: 'under-review' }));
            const brief = marketIntelligenceBriefs.find((item) => item.id === id);
            logEvent(
              `Flagged the market access brief "${brief?.title ?? id}" for review`,
              'market-intelligence',
              profile.name
            );
          }} />

      </div>
    </ConsoleLayout>);

}
