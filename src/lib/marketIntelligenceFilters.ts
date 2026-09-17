import type { MarketIntelligenceBrief } from '../data/marketIntelligence';

export interface MarketIntelligenceFilterState {
  search: string;
  country: string | 'all';
  sectorCode: string | 'all';
}

export function filterBriefs(
briefs: MarketIntelligenceBrief[],
filters: MarketIntelligenceFilterState)
: MarketIntelligenceBrief[] {
  const query = filters.search.trim().toLowerCase();
  return briefs.filter((brief) => {
    const matchesSearch =
    !query ||
    brief.title.toLowerCase().includes(query) ||
    brief.topics.some((topic) => topic.toLowerCase().includes(query));
    const matchesCountry = filters.country === 'all' || brief.targetCountry === filters.country;
    const matchesSector = filters.sectorCode === 'all' || brief.sectorCode === filters.sectorCode;
    return matchesSearch && matchesCountry && matchesSector;
  });
}
