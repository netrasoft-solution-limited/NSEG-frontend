import React from 'react';
import { PackageCheckIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import type { ExporterTierId, TrustTier } from '../../data/trustTiers';

const tierIcons: Record<ExporterTierId, IconComponent> = {
  registered: UserIcon,
  'identity-verified': ShieldCheckIcon,
  'delivery-verified': PackageCheckIcon
};

export const workspaceTierStyles: Record<TrustTier['accent'], string> = {
  dim: 'border-gray-300 bg-white text-gray-700',
  gate: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  gold: 'border-amber-300 bg-amber-50 text-amber-800'
};

export function TierBadge({ tier, size = 'sm' }: {tier: TrustTier;size?: 'sm' | 'lg';}) {
  const Icon = tierIcons[tier.id];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${workspaceTierStyles[tier.accent]} ${
      size === 'lg' ? 'px-3.5 py-1.5 text-[15px]' : 'px-2.5 py-1 text-[12px]'}`
      }>

      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {tier.badge}
    </span>);

}
