import React from 'react';
import { LayoutGridIcon } from 'lucide-react';
import { sectors } from '../../data/sectors';
import { sectorVisual } from '../../lib/sectorVisuals';

interface SectorStripProps {
  value: string | null;
  onChange: (code: string | null) => void;
}

export function SectorStrip({ value, onChange }: SectorStripProps) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-2 pt-1 text-[11px] transition-colors duration-150 ease-out ${
        value === null ? 'border-chalk text-chalk' : 'border-transparent text-chalk-dim hover:text-chalk-muted'}`
        }>

        <LayoutGridIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        All
      </button>
      {sectors.map((sector) => {
        const { icon: Icon } = sectorVisual(sector.code);
        const isActive = value === sector.code;
        return (
          <button
            key={sector.code}
            type="button"
            onClick={() => onChange(isActive ? null : sector.code)}
            className={`flex shrink-0 flex-col items-center gap-1.5 whitespace-nowrap border-b-2 pb-2 pt-1 text-[11px] transition-colors duration-150 ease-out ${
            isActive ? 'border-chalk text-chalk' : 'border-transparent text-chalk-dim hover:text-chalk-muted'}`
            }>

            <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            {sector.label}
          </button>);

      })}
    </div>);

}
