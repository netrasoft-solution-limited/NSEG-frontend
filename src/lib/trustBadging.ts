import { exporterTierOrder, trustTiers, type ExporterTierId, type TrustTier } from '../data/trustTiers';
import { buyerTierOrder, type BuyerTierId } from '../data/buyerTiers';

/** Both sides of the platform progress through ordered tiers that gate entitlements, each
 * named for what was verified — this just walks the ordering rather than duplicating the
 * tier data. */
export function nextExporterTier(currentTierId: ExporterTierId): TrustTier | undefined {
  const index = exporterTierOrder.indexOf(currentTierId);
  if (index === -1 || index === exporterTierOrder.length - 1) return undefined;
  return trustTiers.find((tier) => tier.id === exporterTierOrder[index + 1]);
}

export function isTopExporterTier(tierId: ExporterTierId): boolean {
  return tierId === exporterTierOrder[exporterTierOrder.length - 1];
}

export function isTopBuyerTier(tierId: BuyerTierId): boolean {
  return tierId === buyerTierOrder[buyerTierOrder.length - 1];
}
