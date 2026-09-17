import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, LockIcon, XIcon } from 'lucide-react';
import type { CriteriaKind, Opportunity } from '../../data/opportunities';
import type { TrustTier } from '../../data/trustTiers';
import { canView } from '../../lib/accessControl';
import { modeLabel, sectorLabel, stageLabel } from '../../lib/marketplaceLookups';
import { sectorVisual } from '../../lib/sectorVisuals';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  viewerTier: TrustTier['id'];
  onClose: () => void;
}

const kindMeta: Record<CriteriaKind, { label: string; accent: string; dot: string }> = {
  mandatory: { label: 'Mandatory', accent: 'text-gate-soft', dot: 'bg-gate' },
  preferred: { label: 'Preferred', accent: 'text-sky', dot: 'bg-sky' },
  negotiable: { label: 'Negotiable', accent: 'text-gold', dot: 'bg-gold' },
  informational: { label: 'Informational', accent: 'text-chalk-dim', dot: 'bg-hairline/30' }
};

const gatedKinds: CriteriaKind[] = ['preferred', 'negotiable', 'informational'];

function formatValue(value: NonNullable<Opportunity['indicativeValue']>) {
  return `${value.unit} ${value.min.toLocaleString()}–${value.max.toLocaleString()}`;
}

export function OpportunityDetail({ opportunity, viewerTier, onClose }: OpportunityDetailProps) {
  const unlocked = canView(viewerTier, opportunity.accessTier);
  const mandatory = opportunity.criteria.filter((item) => item.kind === 'mandatory');
  const lockedGroups = gatedKinds.
  map((kind) => ({ kind, items: opportunity.criteria.filter((item) => item.kind === kind) })).
  filter((group) => group.items.length > 0);
  const { icon: SectorIcon, gradient } = sectorVisual(opportunity.sectorCode);

  return (
    <div className="flex flex-col rounded-2xl border border-hairline/10 bg-ink-800/95">
      <div className={`relative aspect-[16/7] overflow-hidden rounded-t-2xl bg-gradient-to-br ${gradient}`}>
        <SectorIcon className="absolute inset-0 m-auto h-16 w-16 text-hairline/20" strokeWidth={1.25} aria-hidden="true" />
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-2.5 py-1 text-[10.5px] text-white backdrop-blur">
          {stageLabel(opportunity.stage)}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close opportunity detail"
          className="absolute right-4 top-4 rounded-lg border border-white/15 bg-black/70 p-2 text-white backdrop-blur transition-colors duration-150 ease-out hover:text-white/80">

          <XIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-chalk-dim">
          {sectorLabel(opportunity.sectorCode)} · {modeLabel(opportunity.mode)}
        </p>
        <h3 className="mt-1 font-display text-[20px] font-semibold leading-snug tracking-[-0.015em] text-chalk">
          {opportunity.title}
        </h3>
        <p className="mt-1 text-[12.5px] text-chalk-dim">
          {opportunity.buyerRegion} · {stageLabel(opportunity.stage)} · Posted {opportunity.postedOn}
        </p>

      <p className="mt-4 text-[13.5px] leading-relaxed text-chalk-muted">{opportunity.summary}</p>

      {opportunity.indicativeValue &&
      <div className="mt-4">
          {unlocked ?
        <span className="inline-flex items-center rounded-lg border border-gate/25 bg-gate/[0.08] px-2.5 py-1 text-[12px] text-gate-soft">
              Indicative value: {formatValue(opportunity.indicativeValue)}
            </span> :

        <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/25 bg-gold/[0.08] px-2.5 py-1 text-[12px] text-gold">
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Indicative value locked
            </span>
        }
        </div>
      }

      <div className="mt-6 space-y-4">
        <div>
          <p className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] ${kindMeta.mandatory.accent}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${kindMeta.mandatory.dot}`} />
            {kindMeta.mandatory.label}
          </p>
          <ul className="mt-2 space-y-1.5">
            {mandatory.map((item) =>
            <li key={item.label} className="text-[13px] leading-snug text-chalk-muted">
                {item.label}
              </li>
            )}
          </ul>
        </div>

        {unlocked ?
        lockedGroups.map((group) =>
        <div key={group.kind}>
              <p className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] ${kindMeta[group.kind].accent}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${kindMeta[group.kind].dot}`} />
                {kindMeta[group.kind].label}
              </p>
              <ul className="mt-2 space-y-1.5">
                {group.items.map((item) =>
            <li key={item.label} className="text-[13px] leading-snug text-chalk-muted">
                    {item.label}
                  </li>
            )}
              </ul>
            </div>
        ) :

        lockedGroups.length > 0 &&
        <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-4">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold">
              <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {lockedGroups.reduce((total, group) => total + group.items.length, 0)} additional criteria locked
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-chalk-muted">
              Preferred, negotiable and informational details unlock once your NATEP profile reaches the required trust tier.
            </p>
            <Link
            to="/workspace"
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-gold hover:text-gold/80">

              See what you need to verify
              <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      </div>
      </div>
    </div>);

}
