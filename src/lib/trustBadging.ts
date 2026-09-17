import { trustTiers, type TrustTier } from '../data/trustTiers';
import { buyerTiers, type BuyerTier, type BuyerTierId } from '../data/buyerTiers';

const exporterTierOrder: TrustTier['id'][] = ['registered', 'verified', 'top-rated'];
const buyerTierOrder: BuyerTierId[] = ['standard', 'established', 'verified-enterprise'];

/** BRD §3.6's Symmetric Trust Badging: both sides of the platform progress through
 * ordered tiers that gate feature entitlements, each with a stated path to the next
 * tier — this just walks the ordering rather than duplicating the tier data. */
export function nextExporterTier(currentTierId: TrustTier['id']): TrustTier | undefined {
  const index = exporterTierOrder.indexOf(currentTierId);
  if (index === -1 || index === exporterTierOrder.length - 1) return undefined;
  return trustTiers.find((tier) => tier.id === exporterTierOrder[index + 1]);
}

export function nextBuyerTier(currentTierId: BuyerTierId): BuyerTier | undefined {
  const index = buyerTierOrder.indexOf(currentTierId);
  if (index === -1 || index === buyerTierOrder.length - 1) return undefined;
  return buyerTiers.find((tier) => tier.id === buyerTierOrder[index + 1]);
}

export function isTopExporterTier(tierId: TrustTier['id']): boolean {
  return tierId === exporterTierOrder[exporterTierOrder.length - 1];
}

export function isTopBuyerTier(tierId: BuyerTierId): boolean {
  return tierId === buyerTierOrder[buyerTierOrder.length - 1];
}
