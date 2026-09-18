export type IntelligenceStatus = 'draft' | 'under-review' | 'published';

/** A Market Access Intelligence brief — destination-market trade rules indexed by
 * country, sector (CPC code), and WTO/GATS mode of supply, maintained by NATEP
 * Administrators under a review workflow before public release (BRD §3.5). Distinct from
 * ConsoleCompliance's register: that covers domestic requirements exporters must meet;
 * this covers foreign market entry conditions exporters should plan around. */
export interface MarketIntelligenceBrief {
  id: string;
  title: string;
  targetCountry: string;
  sectorCode: string;
  modes: string[];
  summary: string;
  topics: string[];
  lastUpdatedOn: string;
  authoredBy: string;
  status: IntelligenceStatus;
}

export const marketIntelligenceBriefs: MarketIntelligenceBrief[] = [
{
  id: 'mi-01',
  title: 'United Kingdom — IT & Data Services Market Access Guide',
  targetCountry: 'United Kingdom',
  sectorCode: '83131',
  modes: ['mode1', 'mode4'],
  summary: 'Covers visa routes for on-site delivery, the UK-Nigeria tax treaty position, and UK data adequacy status for cross-border data processing.',
  topics: ['Visa requirements', 'UK-Nigeria tax treaty', 'Data adequacy status'],
  lastUpdatedOn: '2026-08-20',
  authoredBy: 'NATEP Trade Desk',
  status: 'published'
},
{
  id: 'mi-02',
  title: 'United States — Financial Advisory Compliance Barriers',
  targetCountry: 'United States',
  sectorCode: '83111',
  modes: ['mode1'],
  summary: 'SEC registration exemptions for foreign advisers, FATCA reporting triggers, and the absence of a US-Nigeria double-tax treaty.',
  topics: ['SEC registration exemptions', 'FATCA reporting', 'No double-tax treaty'],
  lastUpdatedOn: '2026-07-29',
  authoredBy: 'NATEP Trade Desk',
  status: 'published'
},
{
  id: 'mi-03',
  title: 'United Arab Emirates — Logistics & Freight Market Entry',
  targetCountry: 'United Arab Emirates',
  sectorCode: '92390',
  modes: ['mode3', 'mode4'],
  summary: 'Free zone licensing options, Emiratisation quotas for commercial presence, and the VAT registration threshold for freight operators.',
  topics: ['Free zone licensing', 'Emiratisation quotas', 'VAT registration threshold'],
  lastUpdatedOn: '2026-09-05',
  authoredBy: 'NATEP Trade Desk',
  status: 'under-review'
},
{
  id: 'mi-04',
  title: 'South Africa — BPO Sector Labour & Data Rules',
  targetCountry: 'South Africa',
  sectorCode: '85999',
  modes: ['mode1'],
  summary: 'POPIA cross-border transfer conditions, B-BBEE preferential scoring exposure, and work visa quotas for supervisory roles.',
  topics: ['POPIA cross-border transfer', 'B-BBEE scoring', 'Work visa quotas'],
  lastUpdatedOn: '2026-08-11',
  authoredBy: 'NATEP Trade Desk',
  status: 'published'
},
{
  id: 'mi-05',
  title: 'Germany — Engineering Services Recognition Pathway',
  targetCountry: 'Germany',
  sectorCode: '86601',
  modes: ['mode4'],
  summary: 'Professional qualification recognition under EU Directive 2005/36, Posted Workers Directive obligations, and VAT reverse-charge mechanics.',
  topics: ['EU qualification recognition', 'Posted Workers Directive', 'VAT reverse charge'],
  lastUpdatedOn: '2026-09-02',
  authoredBy: 'NATEP Trade Desk',
  status: 'draft'
},
{
  id: 'mi-06',
  title: 'Kenya — Cross-Border Legal & Compliance Advisory',
  targetCountry: 'Kenya',
  sectorCode: '92190',
  modes: ['mode1', 'mode2'],
  summary: 'East African Community trade protocol coverage, legal practice reciprocity limits, and withholding tax on cross-border advisory services.',
  topics: ['EAC trade protocol', 'Legal practice reciprocity', 'Withholding tax'],
  lastUpdatedOn: '2026-07-15',
  authoredBy: 'NATEP Trade Desk',
  status: 'published'
}];
