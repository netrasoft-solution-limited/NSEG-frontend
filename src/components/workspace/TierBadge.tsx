import React from 'react';
import { BadgeCheckIcon, CreditCardIcon, MailCheckIcon, PackageCheckIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';
import type { IconComponent } from '../../types/icons';
import type { ExporterTierId, TrustTier } from '../../data/trustTiers';
import type { BuyerTier, BuyerTierId } from '../../data/buyerTiers';

type Accent = 'dim' | 'gate' | 'gold';

const exporterIcons: Record<ExporterTierId, IconComponent> = {
  registered: UserIcon,
  'identity-verified': ShieldCheckIcon,
  'delivery-verified': PackageCheckIcon
};

const buyerIcons: Record<BuyerTierId, IconComponent> = {
  registered: MailCheckIcon,
  'registry-verified': BadgeCheckIcon,
  'payment-verified': CreditCardIcon
};

export const workspaceTierStyles: Record<Accent, string> = {
  dim: 'border-gray-300 bg-white text-gray-700',
  gate: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  gold: 'border-amber-300 bg-amber-50 text-amber-800'
};

function Badge({ label, accent, icon: Icon, size }: {label: string;accent: Accent;icon: IconComponent;size: 'sm' | 'lg';}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${workspaceTierStyles[accent]} ${
      size === 'lg' ? 'px-3.5 py-1.5 text-[15px]' : 'px-2.5 py-1 text-[12px]'}`
      }>

      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {label}
    </span>);

}

export function TierBadge({ tier, size = 'sm' }: {tier: TrustTier;size?: 'sm' | 'lg';}) {
  return <Badge label={tier.badge} accent={tier.accent} icon={exporterIcons[tier.id]} size={size} />;
}

export function BuyerTierBadge({ tier, size = 'sm' }: {tier: BuyerTier;size?: 'sm' | 'lg';}) {
  return <Badge label={tier.badge} accent={tier.accent} icon={buyerIcons[tier.id]} size={size} />;
}
