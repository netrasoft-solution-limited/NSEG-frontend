import type { Actor } from '../data/actors';
import type { TrustTier } from '../data/trustTiers';

export interface ActorFilterState {
  search: string;
  status: 'all' | 'active' | 'suspended';
  tier: TrustTier['id'] | 'all';
}

export function filterActors(all: Actor[], filters: ActorFilterState): Actor[] {
  const query = filters.search.trim().toLowerCase();

  return all.filter((actor) => {
    const matchesSearch =
    !query ||
    actor.name.toLowerCase().includes(query) ||
    actor.email.toLowerCase().includes(query) ||
    actor.natepId.toLowerCase().includes(query);
    const matchesStatus =
    filters.status === 'all' ||
    filters.status === 'suspended' && actor.suspended ||
    filters.status === 'active' && !actor.suspended;
    const matchesTier = filters.tier === 'all' || actor.tier === filters.tier;
    return matchesSearch && matchesStatus && matchesTier;
  });
}

export function formatLastActive(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return `${daysAgo} days ago`;
}
