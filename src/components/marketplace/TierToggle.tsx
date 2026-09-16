import React from 'react';
import { ShieldCheckIcon, TrophyIcon, UserIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import { trustTiers, type TrustTier } from '../../data/trustTiers';

const tierIcons: Record<TrustTier['id'], IconComponent> = {
  registered: UserIcon,
  verified: ShieldCheckIcon,
  'top-rated': TrophyIcon
};

const tierLabels: Record<TrustTier['id'], string> = {
  registered: 'Registered',
  verified: 'Verified',
  'top-rated': 'Top-Rated'
};

const accentStyles = {
  dim: 'border-hairline/14 bg-hairline/[0.05] text-chalk',
  gate: 'border-gate/45 bg-gate/10 text-gate-soft',
  gold: 'border-gold/45 bg-gold/10 text-gold'
} as const;

interface TierToggleProps {
  value: TrustTier['id'];
  onChange: (id: TrustTier['id']) => void;
}

export function TierToggle({ value, onChange }: TierToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Viewing as"
      className="inline-flex items-center gap-1 rounded-xl border border-hairline/10 bg-ink-800/60 p-1">

      {trustTiers.map((tier) => {
        const Icon = tierIcons[tier.id];
        const isActive = tier.id === value;
        return (
          <button
            key={tier.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tier.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-150 ease-out ${
            isActive ? accentStyles[tier.accent] : 'border-transparent text-chalk-muted hover:text-chalk'}`
            }>

            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {tierLabels[tier.id]}
          </button>);

      })}
    </div>);

}
