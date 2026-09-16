/**
 * Raw inbound buyer signals, before officer qualification. Deliberately kept
 * separate from data/opportunities.ts — a signal only becomes an Opportunity
 * once an officer qualifies it, and unqualified signals must never leak into
 * the public Marketplace the way qualified opportunities do.
 */
export interface Signal {
  id: string;
  route: string;
  origin: string;
  sectorCode: string;
  receivedOn: string;
  riskTier: 'New' | 'Review' | 'Flagged';
  summary: string;
}

export const signals: Signal[] = [
{
  id: 'sig-01',
  route: 'Buyer enquiry form',
  origin: 'Rotterdam, Netherlands',
  sectorCode: '85999',
  receivedOn: '2026-09-14',
  riskTier: 'New',
  summary: 'Logistics buyer asking about multilingual support coverage for a pilot programme.'
},
{
  id: 'sig-02',
  route: 'Trade mission lead',
  origin: 'Dubai, UAE',
  sectorCode: '92390',
  receivedOn: '2026-09-13',
  riskTier: 'New',
  summary: 'Freight forwarder following up from the NATEP Gulf trade mission delegation.'
},
{
  id: 'sig-03',
  route: 'Partner referral',
  origin: 'New York, USA',
  sectorCode: '83131',
  receivedOn: '2026-09-12',
  riskTier: 'Review',
  summary: 'Referred by NEXIM desk — buyer identity not yet independently confirmed.'
},
{
  id: 'sig-04',
  route: 'Diaspora network',
  origin: 'London, UK',
  sectorCode: '83111',
  receivedOn: '2026-09-12',
  riskTier: 'New',
  summary: 'Diaspora-network introduction for a financial advisory engagement.'
},
{
  id: 'sig-05',
  route: 'External API',
  origin: 'Singapore',
  sectorCode: '86601',
  receivedOn: '2026-09-11',
  riskTier: 'Flagged',
  summary: 'Auto-ingested via partner API — duplicate-signature check flagged a near-match, needs manual review.'
},
{
  id: 'sig-06',
  route: 'Buyer enquiry form',
  origin: 'Toronto, Canada',
  sectorCode: '82191',
  receivedOn: '2026-09-10',
  riskTier: 'New',
  summary: 'Creative studio enquiry for a regional brand localisation package.'
},
{
  id: 'sig-07',
  route: 'Secure batch upload',
  origin: 'Johannesburg, South Africa',
  sectorCode: '85120',
  receivedOn: '2026-09-09',
  riskTier: 'Review',
  summary: 'Batch-submitted by a partner institution — sector classification needs confirming before qualification.'
}];
