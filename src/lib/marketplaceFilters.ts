import type { Opportunity, OpenStage } from '../data/opportunities';
import { sectorLabel } from './marketplaceLookups';

export interface MarketplaceFilterState {
  search: string;
  sector: string | null;
  mode: string | null;
  stage: OpenStage | null;
}

export function filterOpportunities(all: Opportunity[], filters: MarketplaceFilterState): Opportunity[] {
  const query = filters.search.trim().toLowerCase();

  return all.filter((opportunity) => {
    const matchesSearch =
    !query ||
    opportunity.title.toLowerCase().includes(query) ||
    sectorLabel(opportunity.sectorCode).toLowerCase().includes(query);
    const matchesSector = !filters.sector || opportunity.sectorCode === filters.sector;
    const matchesMode = !filters.mode || opportunity.mode === filters.mode;
    const matchesStage = !filters.stage || opportunity.stage === filters.stage;
    return matchesSearch && matchesSector && matchesMode && matchesStage;
  });
}
