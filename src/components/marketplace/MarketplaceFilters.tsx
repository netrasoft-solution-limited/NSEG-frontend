import React, { useEffect, useRef, useState } from 'react';
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { supplyModes } from '../../data/observatory';
import { pipelineStages } from '../../data/site';
import type { OpenStage } from '../../data/opportunities';
import type { MarketplaceFilterState } from '../../lib/marketplaceFilters';
import { SectorStrip } from './SectorStrip';

const openStages: OpenStage[] = ['qualified', 'matched', 'consented'];

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterState;
  onChange: (filters: MarketplaceFilterState) => void;
}

function Chip({
  label,
  active,
  onClick



}: {label: string;active: boolean;onClick: () => void;}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out ${
      active ? 'border-gate/45 bg-gate/10 text-gate-soft' : 'border-hairline/10 text-chalk-muted hover:border-hairline/20'}`
      }>

      {label}
    </button>);

}

function FiltersPanel({ filters, onChange }: MarketplaceFiltersProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeCount = (filters.mode ? 1 : 0) + (filters.stage ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Filters"
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150 ease-out ${
        activeCount > 0 ? 'border-chalk bg-chalk text-ink' : 'border-hairline/14 text-chalk hover:border-hairline/28'}`
        }>

        <SlidersHorizontalIcon className="h-4 w-4" aria-hidden="true" />
        Filters
        {activeCount > 0 &&
        <span className="rounded-full bg-ink/15 px-1.5 text-[11px] font-semibold">{activeCount}</span>
        }
      </button>

      {open &&
      <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[90vw] rounded-2xl border border-hairline/10 bg-ink-800/95 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-chalk">Filters</p>
            <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="rounded-lg p-1 text-chalk-dim transition-colors duration-150 ease-out hover:text-chalk">

              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Mode of supply</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {supplyModes.map((mode) =>
            <Chip
              key={mode.id}
              label={mode.label}
              active={filters.mode === mode.id}
              onClick={() => onChange({ ...filters, mode: filters.mode === mode.id ? null : mode.id })} />

            )}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-chalk-dim">Stage</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {openStages.map((stageId) => {
              const stage = pipelineStages.find((item) => item.id === stageId);
              if (!stage) return null;
              return (
                <Chip
                  key={stageId}
                  label={stage.label}
                  active={filters.stage === stageId}
                  onClick={() => onChange({ ...filters, stage: filters.stage === stageId ? null : stageId })} />);


            })}
            </div>
          </div>

          {activeCount > 0 &&
        <button
          type="button"
          onClick={() => onChange({ ...filters, mode: null, stage: null })}
          className="mt-4 text-[12.5px] font-medium text-chalk-muted underline underline-offset-2 hover:text-chalk">

              Clear filters
            </button>
        }
        </div>
      }
    </div>);

}

export function MarketplaceFilters({ filters, onChange }: MarketplaceFiltersProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-md">
        <SearchIcon
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-dim"
          aria-hidden="true" />

        <input
          type="search"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Search by title or sector"
          className="w-full rounded-full border border-hairline/12 bg-hairline/[0.04] py-3 pl-11 pr-4 text-[13.5px] text-chalk placeholder:text-chalk-dim focus:border-gate/45 focus:outline-none" />

      </div>

      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <SectorStrip value={filters.sector} onChange={(sector) => onChange({ ...filters, sector })} />
        </div>
        <FiltersPanel filters={filters} onChange={onChange} />
      </div>
    </div>);

}
