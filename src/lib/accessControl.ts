import { exporterTierOrder, type ExporterTierId } from '../data/trustTiers';

export function tierRank(id: ExporterTierId): number {
  return exporterTierOrder.indexOf(id);
}

/** True when a viewer at `viewerTier` can see content gated at `requiredTier`. */
export function canView(viewerTier: ExporterTierId, requiredTier: ExporterTierId): boolean {
  return tierRank(viewerTier) >= tierRank(requiredTier);
}
