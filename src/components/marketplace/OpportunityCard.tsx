import React from 'react';
import { LockIcon } from 'lucide-react';
import type { Opportunity } from '../../data/opportunities';
import type { TrustTier } from '../../data/trustTiers';
import { canView } from '../../lib/accessControl';
import { modeLabel, sectorLabel, stageLabel } from '../../lib/marketplaceLookups';
import { sectorVisual } from '../../lib/sectorVisuals';

interface OpportunityCardProps {
  opportunity: Opportunity;
  viewerTier: TrustTier['id'];
  onSelect?: (id: string) => void;
  compact?: boolean;
}

function formatValue(value: NonNullable<Opportunity['indicativeValue']>) {
  return `${value.unit} ${value.min.toLocaleString()}–${value.max.toLocaleString()}`;
}

export function OpportunityCard({ opportunity, viewerTier, onSelect, compact = false }: OpportunityCardProps) {
  const unlocked = canView(viewerTier, opportunity.accessTier);
  const mandatoryCount = opportunity.criteria.filter((item) => item.kind === 'mandatory').length;
  const lockedCount = opportunity.criteria.length - mandatoryCount;
  const { icon: SectorIcon, gradient } = sectorVisual(opportunity.sectorCode);

  const Wrapper = onSelect ? 'button' : 'div';

  return (
    <Wrapper
      type={onSelect ? 'button' : undefined}
      onClick={onSelect ? () => onSelect(opportunity.id) : undefined}
      className={`group flex w-full flex-col gap-3 text-left ${onSelect ? 'cursor-pointer' : ''}`}>

      <div className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}>
        <SectorIcon
          className="absolute inset-0 m-auto h-14 w-14 text-hairline/20 transition-transform duration-200 ease-out group-hover:scale-105"
          strokeWidth={1.25}
          aria-hidden="true" />

        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10.5px] text-white backdrop-blur">
          {stageLabel(opportunity.stage)}
        </span>
        {!unlocked &&
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#f5b544]/90 px-2.5 py-1 text-[10.5px] font-medium text-black">
            <LockIcon className="h-3 w-3" aria-hidden="true" />
            {lockedCount} locked
          </span>
        }
      </div>

      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-chalk">{opportunity.title}</h3>
        </div>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-chalk-muted">
          {sectorLabel(opportunity.sectorCode)} · {modeLabel(opportunity.mode)}
        </p>
        <p className="text-[12.5px] text-chalk-dim">{opportunity.buyerRegion}</p>

        {!compact &&
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-chalk-muted">{opportunity.summary}</p>
        }

        <p className="mt-2 text-[13.5px]">
          {unlocked && opportunity.indicativeValue ?
          <span className="font-semibold text-chalk">{formatValue(opportunity.indicativeValue)}</span> :
          !unlocked && opportunity.indicativeValue ?
          <span className="inline-flex items-center gap-1 font-medium text-gold">
              <LockIcon className="h-3 w-3" aria-hidden="true" />
              Verify for value
            </span> :

          <span className="font-medium text-chalk-muted">Value on request</span>
          }
          <span className="text-chalk-dim"> · {mandatoryCount} mandatory criteria</span>
        </p>
      </div>
    </Wrapper>);

}
