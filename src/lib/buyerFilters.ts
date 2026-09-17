import type { Buyer } from '../data/buyers';
import type { BuyerTierId } from '../data/buyerTiers';

export interface BuyerFilterState {
  search: string;
  tier: BuyerTierId | 'all';
}

export function filterBuyers(all: Buyer[], filters: BuyerFilterState): Buyer[] {
  const query = filters.search.trim().toLowerCase();

  return all.filter((buyer) => {
    const matchesSearch =
    !query ||
    buyer.name.toLowerCase().includes(query) ||
    buyer.email.toLowerCase().includes(query) ||
    buyer.referenceId.toLowerCase().includes(query);
    const matchesTier = filters.tier === 'all' || buyer.tier === filters.tier;
    return matchesSearch && matchesTier;
  });
}
