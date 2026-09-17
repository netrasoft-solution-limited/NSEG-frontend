export type TaxonomyCategory = 'service-sectors' | 'supply-modes' | 'exporter-trust-tiers' | 'buyer-tiers';

/** Version metadata for the platform's controlled vocabularies (BRD §2.7 — semantic
 * versioning, retired codes flagged Deprecated rather than deleted). This wraps the live
 * code tables (sectors.ts, observatory.ts's supplyModes, trustTiers.ts, buyerTiers.ts)
 * rather than duplicating them, so this file never drifts out of sync with what every
 * dropdown in the app actually offers. */
export interface TaxonomyVersion {
  category: TaxonomyCategory;
  label: string;
  standard: string;
  version: string;
  lastUpdatedOn: string;
}

export const taxonomyVersions: TaxonomyVersion[] = [
{ category: 'service-sectors', label: 'Service sector codes', standard: 'UN CPC Ver. 2.1', version: 'v2.1', lastUpdatedOn: '2026-06-01' },
{ category: 'supply-modes', label: 'WTO/GATS modes of supply', standard: 'WTO/GATS', version: 'v1.0', lastUpdatedOn: '2026-01-15' },
{ category: 'exporter-trust-tiers', label: 'Exporter trust tiers', standard: 'NATEP internal', version: 'v1.3', lastUpdatedOn: '2026-08-01' },
{ category: 'buyer-tiers', label: 'Buyer tiers', standard: 'NATEP internal', version: 'v1.1', lastUpdatedOn: '2026-07-10' }];


/** Retired codes preserved for historical reference — never removed outright, since prior
 * records (opportunities, signals) may still cite them (BRD: "Retired codes are flagged
 * as Deprecated to preserve historical data references"). */
export interface DeprecatedCode {
  category: TaxonomyCategory;
  code: string;
  label: string;
  deprecatedOn: string;
  supersededByCode?: string;
  supersededByLabel?: string;
}

export const deprecatedCodes: DeprecatedCode[] = [
{
  category: 'service-sectors',
  code: '82190',
  label: 'General media production (legacy)',
  deprecatedOn: '2026-05-20',
  supersededByCode: '82191',
  supersededByLabel: 'Creative & media production'
}];
