import type { TrustTier } from '../data/trustTiers';

const tierOrder: TrustTier['id'][] = ['registered', 'verified', 'top-rated'];

export function tierRank(id: TrustTier['id']): number {
  return tierOrder.indexOf(id);
}

/** True when a viewer at `viewerTier` can see content gated at `requiredTier`. */
export function canView(viewerTier: TrustTier['id'], requiredTier: TrustTier['id']): boolean {
  return tierRank(viewerTier) >= tierRank(requiredTier);
}
