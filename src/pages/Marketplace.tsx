import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayersIcon } from 'lucide-react';
import { TopNav } from '../components/site/TopNav';
import { SiteFooter } from '../components/site/SiteFooter';
import { SectionEyebrow } from '../components/site/SectionEyebrow';
import { TierToggle } from '../components/marketplace/TierToggle';
import { MarketplaceFilters } from '../components/marketplace/MarketplaceFilters';
import { OpportunityCard } from '../components/marketplace/OpportunityCard';
import { OpportunityModal } from '../components/marketplace/OpportunityModal';
import { Pagination } from '../components/marketplace/Pagination';
import { opportunities } from '../data/opportunities';
import type { TrustTier } from '../data/trustTiers';
import { filterOpportunities, type MarketplaceFilterState } from '../lib/marketplaceFilters';

const PAGE_SIZE = 8;

const emptyFilters: MarketplaceFilterState = { search: '', sector: null, mode: null, stage: null };

export function Marketplace() {
  const [viewerTier, setViewerTier] = useState<TrustTier['id']>('registered');
  const [filters, setFilters] = useState<MarketplaceFilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [filters, viewerTier]);

  const filtered = filterOpportunities(opportunities, filters);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = opportunities.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="min-h-full w-full">
      <TopNav />
      <main className="mx-auto max-w-shell px-4 pb-24 pt-32 sm:pt-40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <SectionEyebrow icon={LayersIcon}>Opportunity marketplace</SectionEyebrow>
            <h1 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
              Officer-qualified demand, not an open board
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-chalk-muted">
              Every listing here has already passed officer review. Mandatory requirements are always visible so you
              can self-qualify — the rest unlocks as your NATEP profile earns trust.
            </p>
            <p className="mt-3 text-[14px] text-chalk-muted">
              Sourcing services from Nigeria?{' '}
              <Link to="/buyer/requests/new" className="font-semibold text-gate-soft underline-offset-4 hover:underline">
                Post a request
              </Link>
            </p>
          </div>
          <div className="shrink-0">
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Viewing as</p>
            <TierToggle value={viewerTier} onChange={setViewerTier} />
          </div>
        </div>

        <div className="mt-10 border-b border-hairline/8 pb-6">
          <MarketplaceFilters filters={filters} onChange={setFilters} />
        </div>

        <p className="mt-6 text-[12.5px] text-chalk-dim">
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
        </p>

        <div className="mt-4 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((opportunity) =>
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            viewerTier={viewerTier}
            onSelect={setSelectedId} />

          )}
        </div>

        {filtered.length === 0 &&
        <p className="mt-4 rounded-2xl border border-hairline/8 bg-hairline/[0.02] p-6 text-center text-[13px] text-chalk-dim">
            No opportunities match these filters yet.
          </p>
        }

        <div className="mt-10">
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </div>
      </main>

      {selected &&
      <OpportunityModal opportunity={selected} viewerTier={viewerTier} onClose={() => setSelectedId(null)} />
      }

      <SiteFooter />
    </div>);

}
