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
{ category: 'exporter-trust-tiers', label: 'Exporter trust tiers', standard: 'NATEP Gateway PRD v1.0 · D-06', version: 'v2.0', lastUpdatedOn: '2026-09-17' },
{ category: 'buyer-tiers', label: 'Buyer tiers', standard: 'NATEP Gateway PRD v1.0 · §3.2', version: 'v2.0', lastUpdatedOn: '2026-09-17' }];


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
},
// v2.0 replaced the profile-completion ladder with one diagnostic-driven ladder whose
// names state what was verified (PRD D-06, §3.2) — the old quality-sounding codes stay
// resolvable for records that cited them.
{
  category: 'exporter-trust-tiers',
  code: 'verified',
  label: 'NATEP Verified Exporter',
  deprecatedOn: '2026-09-17',
  supersededByCode: 'identity-verified',
  supersededByLabel: 'Identity Verified'
},
{
  category: 'exporter-trust-tiers',
  code: 'top-rated',
  label: 'Top-Rated Export Partner',
  deprecatedOn: '2026-09-17',
  supersededByCode: 'delivery-verified',
  supersededByLabel: 'Delivery Verified'
},
{
  category: 'buyer-tiers',
  code: 'standard',
  label: 'Standard Sourcing Partner',
  deprecatedOn: '2026-09-17',
  supersededByCode: 'registered',
  supersededByLabel: 'Registered'
},
{
  category: 'buyer-tiers',
  code: 'established',
  label: 'Established Trade Partner',
  deprecatedOn: '2026-09-17',
  supersededByCode: 'registry-verified',
  supersededByLabel: 'Registry Verified'
},
{
  category: 'buyer-tiers',
  code: 'verified-enterprise',
  label: 'Verified Enterprise Partner',
  deprecatedOn: '2026-09-17',
  supersededByCode: 'payment-verified',
  supersededByLabel: 'Payment Verified'
}];
