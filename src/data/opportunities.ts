import type { TrustTier } from './trustTiers';

export type CriteriaKind = 'mandatory' | 'preferred' | 'negotiable' | 'informational';

export interface OpportunityCriterion {
  kind: CriteriaKind;
  label: string;
}

/** Subset of pipelineStages that still count as "open" to browse — a signal
 * that hasn't been officer-qualified yet must not reach exporters, and a
 * contracted/verified opportunity is no longer open. */
export type OpenStage = 'qualified' | 'matched' | 'consented';

export interface Opportunity {
  id: string;
  title: string;
  sectorCode: string;
  mode: string;
  buyerRegion: string;
  stage: OpenStage;
  accessTier: TrustTier['id'];
  postedOn: string;
  indicativeValue?: { min: number; max: number; unit: string };
  summary: string;
  criteria: OpportunityCriterion[];
}

export const opportunities: Opportunity[] = [
{
  id: 'opp-01',
  title: 'Tier-1 helpdesk coverage pilot',
  sectorCode: '85999',
  mode: 'mode1',
  buyerRegion: 'Western Europe',
  stage: 'qualified',
  accessTier: 'registered',
  postedOn: '2026-08-18',
  summary: 'A logistics buyer is qualifying a 60-day English-language helpdesk coverage pilot.',
  criteria: [
  { kind: 'mandatory', label: 'Minimum 8-seat concurrent capacity' },
  { kind: 'mandatory', label: 'CAC registration current and verifiable' },
  { kind: 'preferred', label: 'Prior logistics or freight sector experience' },
  { kind: 'negotiable', label: 'Shift pattern (buyer open to 2 of 3 proposed windows)' },
  { kind: 'informational', label: 'Buyer intends to extend quarterly subject to KPI review' }]

},
{
  id: 'opp-02',
  title: 'Statutory audit support engagement',
  sectorCode: '83111',
  mode: 'mode1',
  buyerRegion: 'Southern Africa',
  stage: 'qualified',
  accessTier: 'registered',
  postedOn: '2026-08-21',
  summary: 'A regional holding company is qualifying support for a statutory audit cycle.',
  criteria: [
  { kind: 'mandatory', label: 'IFRS-qualified lead reviewer on the engagement team' },
  { kind: 'mandatory', label: 'Professional indemnity cover evidence' },
  { kind: 'preferred', label: 'Experience with multi-subsidiary consolidations' },
  { kind: 'negotiable', label: 'Engagement length (6-10 weeks, buyer flexible)' },
  { kind: 'informational', label: 'Findings feed into a board audit committee review' }]

},
{
  id: 'opp-03',
  title: 'Public sector website accessibility remediation',
  sectorCode: '83131',
  mode: 'mode1',
  buyerRegion: 'North America',
  stage: 'qualified',
  accessTier: 'registered',
  postedOn: '2026-08-25',
  summary: 'A municipal agency is qualifying a WCAG 2.2 remediation project for a public-facing portal.',
  criteria: [
  { kind: 'mandatory', label: 'Demonstrated WCAG 2.2 AA remediation portfolio' },
  { kind: 'mandatory', label: 'Team members with accessibility auditor certification' },
  { kind: 'preferred', label: 'Prior public-sector delivery experience' },
  { kind: 'negotiable', label: 'Delivery in 2 phases vs. single milestone' },
  { kind: 'informational', label: 'Procurement is subject to municipal budget approval' }]

},
{
  id: 'opp-04',
  title: 'Multilingual customer support pilot',
  sectorCode: '85999',
  mode: 'mode1',
  buyerRegion: 'Western Europe',
  stage: 'matched',
  accessTier: 'registered',
  postedOn: '2026-08-02',
  summary: 'A BPO buyer is qualifying a 90-day pilot for French/English support coverage.',
  criteria: [
  { kind: 'mandatory', label: 'ISO 27001 evidence or equivalent data-handling attestation' },
  { kind: 'mandatory', label: 'Minimum 15-seat concurrent capacity' },
  { kind: 'preferred', label: 'Existing telecom or BPO sector experience' },
  { kind: 'negotiable', label: 'Shift coverage pattern (buyer open to 2 of 3 proposed windows)' },
  { kind: 'informational', label: 'Buyer intends to renew quarterly subject to KPI review' }]

},
{
  id: 'opp-05',
  title: 'Freight visibility dashboard build',
  sectorCode: '92390',
  mode: 'mode1',
  buyerRegion: 'Gulf States',
  stage: 'qualified',
  accessTier: 'registered',
  postedOn: '2026-08-29',
  summary: 'A freight forwarder is qualifying a real-time shipment visibility dashboard build.',
  criteria: [
  { kind: 'mandatory', label: 'Integration experience with EDI/API carrier feeds' },
  { kind: 'mandatory', label: 'Data residency compliant with buyer jurisdiction' },
  { kind: 'preferred', label: 'Familiarity with customs clearance workflows' },
  { kind: 'negotiable', label: 'Hosting arrangement (buyer cloud vs. vendor-managed)' },
  { kind: 'informational', label: 'Dashboard feeds an existing internal ops tool' }]

},
{
  id: 'opp-06',
  title: 'Remote radiology second-read coverage',
  sectorCode: '85120',
  mode: 'mode1',
  buyerRegion: 'Western Europe',
  stage: 'qualified',
  accessTier: 'registered',
  postedOn: '2026-09-01',
  summary: 'A telehealth network is qualifying overnight second-read radiology coverage.',
  criteria: [
  { kind: 'mandatory', label: 'Board-certified radiologists with cross-border reporting rights' },
  { kind: 'mandatory', label: 'HIPAA/GDPR-aligned data handling attestation' },
  { kind: 'preferred', label: 'Prior teleradiology network experience' },
  { kind: 'negotiable', label: 'Coverage window (overnight only vs. extended hours)' },
  { kind: 'informational', label: 'Volume is expected to scale after a 3-month trial' }]

},
{
  id: 'opp-07',
  title: 'Cross-border payroll compliance review',
  sectorCode: '92190',
  mode: 'mode1',
  buyerRegion: 'East Africa',
  stage: 'matched',
  accessTier: 'identity-verified',
  postedOn: '2026-08-09',
  indicativeValue: { min: 12000, max: 28000, unit: 'USD' },
  summary: 'A regional employer of record is qualifying a payroll compliance review across three jurisdictions.',
  criteria: [
  { kind: 'mandatory', label: 'Working knowledge of employer-of-record statutory regimes' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'Experience advising employer-of-record platforms' },
  { kind: 'negotiable', label: 'Reporting format (buyer template vs. vendor standard)' },
  { kind: 'informational', label: 'Findings will inform a Q1 platform expansion decision' }]

},
{
  id: 'opp-08',
  title: 'Enterprise data migration advisory',
  sectorCode: '83131',
  mode: 'mode1',
  buyerRegion: 'North America',
  stage: 'matched',
  accessTier: 'identity-verified',
  postedOn: '2026-08-14',
  indicativeValue: { min: 25000, max: 50000, unit: 'USD' },
  summary: 'A manufacturing group is qualifying advisory support for a legacy ERP-to-cloud migration.',
  criteria: [
  { kind: 'mandatory', label: 'Documented ERP migration case studies at comparable scale' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'Familiarity with the buyer\'s existing ERP vendor' },
  { kind: 'negotiable', label: 'Engagement structure (fixed-fee vs. milestone-based)' },
  { kind: 'informational', label: 'Migration is planned in three tranches over 9 months' }]

},
{
  id: 'opp-09',
  title: 'Brand localisation for regional launch',
  sectorCode: '82191',
  mode: 'mode1',
  buyerRegion: 'Southern Africa',
  stage: 'qualified',
  accessTier: 'identity-verified',
  postedOn: '2026-08-30',
  indicativeValue: { min: 8000, max: 20000, unit: 'USD' },
  summary: 'A consumer brand is qualifying a localisation package for a regional product launch.',
  criteria: [
  { kind: 'mandatory', label: 'Portfolio of prior regional brand localisation work' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'In-house video production capability' },
  { kind: 'negotiable', label: 'Asset delivery format and turnaround windows' },
  { kind: 'informational', label: 'Launch date is provisional pending internal sign-off' }]

},
{
  id: 'opp-10',
  title: 'Structural engineering peer review',
  sectorCode: '86601',
  mode: 'mode1',
  buyerRegion: 'Gulf States',
  stage: 'matched',
  accessTier: 'identity-verified',
  postedOn: '2026-08-06',
  indicativeValue: { min: 18000, max: 35000, unit: 'USD' },
  summary: 'A developer is qualifying an independent peer review of structural designs for a mixed-use site.',
  criteria: [
  { kind: 'mandatory', label: 'Licensed structural engineer of record on the team' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'Experience with mixed-use or high-rise reviews' },
  { kind: 'negotiable', label: 'Review format (single report vs. staged sign-offs)' },
  { kind: 'informational', label: 'Review feeds a permitting submission with a fixed filing date' }]

},
{
  id: 'opp-11',
  title: 'Diaspora remittance app support desk',
  sectorCode: '85999',
  mode: 'mode4',
  buyerRegion: 'North America',
  stage: 'consented',
  accessTier: 'identity-verified',
  postedOn: '2026-07-28',
  indicativeValue: { min: 10000, max: 24000, unit: 'USD' },
  summary: 'A fintech buyer has granted consent for a shortlist to support a remittance app helpdesk.',
  criteria: [
  { kind: 'mandatory', label: 'PCI-DSS aware handling of support tickets' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'Fintech or payments support experience' },
  { kind: 'negotiable', label: 'Escalation SLA tiers' },
  { kind: 'informational', label: 'Referral has been sent; buyer is reviewing the shortlist' }]

},
{
  id: 'opp-12',
  title: 'FX hedging advisory for export receivables',
  sectorCode: '83111',
  mode: 'mode1',
  buyerRegion: 'Western Europe',
  stage: 'consented',
  accessTier: 'identity-verified',
  postedOn: '2026-07-22',
  indicativeValue: { min: 15000, max: 40000, unit: 'USD' },
  summary: 'A trading house has granted consent for a shortlist to advise on FX hedging for export receivables.',
  criteria: [
  { kind: 'mandatory', label: 'Demonstrated FX hedging advisory track record' },
  { kind: 'mandatory', label: 'Verified sector regulatory clearance on file' },
  { kind: 'preferred', label: 'Experience with CBN FX reporting requirements' },
  { kind: 'negotiable', label: 'Advisory retainer vs. per-engagement fee' },
  { kind: 'informational', label: 'Referral has been sent; buyer is reviewing the shortlist' }]

},
{
  id: 'opp-13',
  title: 'Enterprise cloud security assessment',
  sectorCode: '83131',
  mode: 'mode1',
  buyerRegion: 'North America',
  stage: 'matched',
  accessTier: 'delivery-verified',
  postedOn: '2026-08-11',
  indicativeValue: { min: 45000, max: 90000, unit: 'USD' },
  summary: 'A financial services enterprise is qualifying a full cloud security assessment across two subsidiaries.',
  criteria: [
  { kind: 'mandatory', label: 'CREST or equivalent penetration testing accreditation' },
  { kind: 'mandatory', label: 'Delivery Verified standing with live credentials' },
  { kind: 'preferred', label: 'Prior financial services engagements at enterprise scale' },
  { kind: 'negotiable', label: 'Reporting cadence and executive readout format' },
  { kind: 'informational', label: 'Engagement is directly invited, not open to general shortlisting' }]

},
{
  id: 'opp-14',
  title: 'Regional data centre migration programme',
  sectorCode: '83131',
  mode: 'mode3',
  buyerRegion: 'Gulf States',
  stage: 'matched',
  accessTier: 'delivery-verified',
  postedOn: '2026-08-04',
  indicativeValue: { min: 120000, max: 250000, unit: 'USD' },
  summary: 'A sovereign-linked enterprise is qualifying a multi-year data centre migration programme with a local presence requirement.',
  criteria: [
  { kind: 'mandatory', label: 'Commercial presence or credible presence plan in buyer jurisdiction' },
  { kind: 'mandatory', label: 'Delivery Verified standing with live credentials' },
  { kind: 'preferred', label: 'Prior sovereign or government-adjacent delivery experience' },
  { kind: 'negotiable', label: 'Phasing across the multi-year programme' },
  { kind: 'informational', label: 'Engagement is directly invited, not open to general shortlisting' }]

},
{
  id: 'opp-15',
  title: 'Continental logistics network optimisation',
  sectorCode: '92390',
  mode: 'mode1',
  buyerRegion: 'Southern Africa',
  stage: 'consented',
  accessTier: 'delivery-verified',
  postedOn: '2026-07-30',
  indicativeValue: { min: 60000, max: 140000, unit: 'USD' },
  summary: 'A pan-African distributor has granted consent for a directly invited proposal on network optimisation.',
  criteria: [
  { kind: 'mandatory', label: 'Demonstrated multi-country logistics optimisation delivery' },
  { kind: 'mandatory', label: 'Delivery Verified standing with live credentials' },
  { kind: 'preferred', label: 'Existing footprint across at least three African markets' },
  { kind: 'negotiable', label: 'Success-fee component tied to cost savings realised' },
  { kind: 'informational', label: 'Referral has been sent; buyer is reviewing the proposal' }]

},
{
  id: 'opp-16',
  title: 'National claims processing modernisation',
  sectorCode: '83111',
  mode: 'mode1',
  buyerRegion: 'Western Europe',
  stage: 'qualified',
  accessTier: 'delivery-verified',
  postedOn: '2026-09-03',
  indicativeValue: { min: 80000, max: 200000, unit: 'USD' },
  summary: 'A national insurer is qualifying an enterprise-scale claims processing modernisation programme.',
  criteria: [
  { kind: 'mandatory', label: 'Insurance-sector claims platform delivery experience' },
  { kind: 'mandatory', label: 'Delivery Verified standing with live credentials' },
  { kind: 'preferred', label: 'Experience with regulatory reporting for insurers' },
  { kind: 'negotiable', label: 'Programme governance model' },
  { kind: 'informational', label: 'Engagement is directly invited, not open to general shortlisting' }]

}];
