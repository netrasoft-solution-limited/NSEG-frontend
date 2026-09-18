import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, LayersIcon } from 'lucide-react';
import { Reveal } from '../motion/Reveal';
import { SectionEyebrow } from '../site/SectionEyebrow';
import { TierToggle } from '../marketplace/TierToggle';
import { OpportunityCard } from '../marketplace/OpportunityCard';
import { opportunities } from '../../data/opportunities';
import type { TrustTier } from '../../data/trustTiers';

const preview = opportunities.slice(0, 3);

export function MarketplacePreview() {
  const [viewerTier, setViewerTier] = useState<TrustTier['id']>('registered');

  return (
    <section className="mx-auto max-w-shell px-4 pb-24 sm:pb-32">
      <Reveal>
        <div className="max-w-2xl">
          <SectionEyebrow icon={LayersIcon}>Curated demand</SectionEyebrow>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-chalk sm:text-[44px]">
            Real opportunities, already qualified
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-muted">
            Every opportunity is officer-qualified before it's listed — this isn't an open marketplace. Mandatory
            criteria are always visible; the rest unlocks as your profile earns trust.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Preview as</p>
          <TierToggle value={viewerTier} onChange={setViewerTier} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {preview.map((opportunity) =>
          <OpportunityCard key={opportunity.id} opportunity={opportunity} viewerTier={viewerTier} compact />
          )}
        </div>

        <div className="mt-8">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-gate px-5 py-3 text-[14px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-gate-deep">

            Browse the marketplace
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </Reveal>
    </section>);

}
