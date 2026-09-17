import type { EvidenceKey, ExporterTrack } from './trustTiers';

export type RequirementCategory = 'statutory' | 'professional' | 'fiscal' | 'fx-settlement' | 'buyer-standard';
export type RequirementStatus = 'current' | 'under-review' | 'superseded';
export type SupplyModeId = 'mode1' | 'mode2' | 'mode3' | 'mode4';
export type TargetMarketId = 'uk' | 'eu' | 'us' | 'ecowas' | 'gcc';

export const targetMarkets: { id: TargetMarketId; label: string }[] = [
{ id: 'uk', label: 'United Kingdom' },
{ id: 'eu', label: 'European Union' },
{ id: 'us', label: 'United States' },
{ id: 'ecowas', label: 'ECOWAS region' },
{ id: 'gcc', label: 'Gulf states (GCC)' }];


/** REG-01 applicability. A missing list means "applies to every value". */
export interface RequirementApplicability {
  tracks?: ExporterTrack[];
  modes?: SupplyModeId[];
  markets?: TargetMarketId[];
}

export interface RegulatoryRequirement {
  id: string;
  title: string;
  category: RequirementCategory;
  authority: string;
  sectorCode?: string;
  status: RequirementStatus;
  lastReviewedOn: string;
  reviewDue: boolean;
  /** REG-02: published versions only. A revision supersedes the prior version, never deletes it. */
  version: number;
  /** The competent-authority officers who signed this version off. */
  signedOffBy: string[];
  signedOffOn: string;
  /** Plain-language summary written for the exporter, not the lawyer. */
  summary: string;
  /** Where the exporter actually goes to do this. */
  officialChannel: string;
  evidenceExpected: string;
  sourceCitation: string;
  effectiveOn: string;
  nextReviewOn: string;
  appliesTo: RequirementApplicability;
  /** When set, an exporter holding this verified evidence already meets the requirement. */
  satisfiedBy?: EvidenceKey;
}

export const requirementCategoryLabels: Record<RequirementCategory, string> = {
  statutory: 'Statutory',
  professional: 'Professional',
  fiscal: 'Fiscal',
  'fx-settlement': 'FX / Settlement',
  'buyer-standard': 'Buyer-driven standard'
};

/** The order an exporter tends to work through them: be a legal entity, be taxable,
 * be licensed, meet the buyer's bar, then get paid. */
export const pathwayCategoryOrder: RequirementCategory[] = [
'statutory',
'fiscal',
'professional',
'buyer-standard',
'fx-settlement'];


export const regulatoryRequirements: RegulatoryRequirement[] = [
{
  id: 'reg-01',
  title: 'CAC registration currency for service exporters',
  category: 'statutory',
  authority: 'Corporate Affairs Commission',
  status: 'current',
  lastReviewedOn: '2026-07-12',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Ngozi Eze', 'Ifeoma Nwosu'],
  signedOffOn: '2026-07-12',
  summary: 'Your company must be registered with the CAC and up to date on annual returns before it can contract with a foreign buyer through the Gateway.',
  officialChannel: 'CAC Company Registration Portal — annual returns and status report',
  evidenceExpected: 'CAC certificate and a status report issued within the last 12 months',
  sourceCitation: 'Companies and Allied Matters Act 2020',
  effectiveOn: '2026-01-01',
  nextReviewOn: '2027-01-12',
  appliesTo: { tracks: ['firm'] },
  satisfiedBy: 'cac'
},
{
  id: 'reg-02',
  title: 'NDPA cross-border data transfer conditions',
  category: 'statutory',
  authority: 'Nigeria Data Protection Commission',
  sectorCode: '83131',
  status: 'under-review',
  lastReviewedOn: '2026-06-02',
  reviewDue: true,
  version: 1,
  signedOffBy: ['Aisha Bello', 'Kunle Bakare'],
  signedOffOn: '2026-06-02',
  summary: 'Moving personal data about Nigerians to a client abroad needs a lawful transfer basis.',
  officialChannel: 'Nigeria Data Protection Commission — compliance filings',
  evidenceExpected: 'Transfer impact note and data processing agreement',
  sourceCitation: 'Nigeria Data Protection Act 2023',
  effectiveOn: '2025-03-01',
  nextReviewOn: '2026-09-02',
  appliesTo: { modes: ['mode1'] }
},
{
  id: 'reg-03',
  title: 'Professional indemnity cover threshold — advisory services',
  category: 'professional',
  authority: 'NATEP Secretariat',
  sectorCode: '83111',
  status: 'current',
  lastReviewedOn: '2026-08-01',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Emeka Obi'],
  signedOffOn: '2026-08-01',
  summary: 'Advisory engagements above the programme threshold need professional indemnity insurance in force for the whole contract.',
  officialChannel: 'Any NAICOM-licensed insurer — certificate uploaded to your evidence vault',
  evidenceExpected: 'Insurance certificate showing cover amount and validity dates',
  sourceCitation: 'NATEP Programme Operating Manual',
  effectiveOn: '2026-04-01',
  nextReviewOn: '2027-02-01',
  appliesTo: {}
},
{
  id: 'reg-04',
  title: 'Licensed structural engineer of record requirement',
  category: 'professional',
  authority: 'Council for the Regulation of Engineering in Nigeria',
  sectorCode: '86601',
  status: 'current',
  lastReviewedOn: '2026-05-19',
  reviewDue: true,
  version: 1,
  signedOffBy: ['Yusuf Garba'],
  signedOffOn: '2026-05-19',
  summary: 'Engineering design work signed off for a client must name a COREN-registered engineer who takes responsibility for it.',
  officialChannel: 'COREN — practitioner registration and annual practice licence',
  evidenceExpected: 'COREN registration number and current practice licence',
  sourceCitation: 'Engineers (Registration, etc.) Act',
  effectiveOn: '2025-11-01',
  nextReviewOn: '2026-08-19',
  appliesTo: {}
},
{
  id: 'reg-05',
  title: 'Tax identification number verification for cross-border invoicing',
  category: 'fiscal',
  authority: 'Nigeria Revenue Service',
  status: 'current',
  lastReviewedOn: '2026-07-28',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Funke Adebayo'],
  signedOffOn: '2026-07-28',
  summary: 'Every export invoice must carry a valid tax identification number so the income is recorded correctly.',
  officialChannel: 'Nigeria Revenue Service — TIN registration and validation',
  evidenceExpected: 'TIN certificate or validation result',
  sourceCitation: 'Nigeria Revenue Service guidance on export invoicing',
  effectiveOn: '2026-01-01',
  nextReviewOn: '2027-01-28',
  appliesTo: {},
  satisfiedBy: 'tin'
},
{
  id: 'reg-06',
  title: 'Withholding tax treatment for exported professional services',
  category: 'fiscal',
  authority: 'Nigeria Revenue Service',
  sectorCode: '83111',
  status: 'superseded',
  lastReviewedOn: '2026-03-14',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Funke Adebayo'],
  signedOffOn: '2026-03-14',
  summary: 'Replaced by the current export invoicing guidance.',
  officialChannel: 'Nigeria Revenue Service',
  evidenceExpected: '—',
  sourceCitation: 'Superseded circular',
  effectiveOn: '2024-06-01',
  nextReviewOn: '—',
  appliesTo: {}
},
{
  id: 'reg-07',
  title: 'FX repatriation window for service export receivables',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  status: 'current',
  lastReviewedOn: '2026-08-15',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Musa Ibrahim', 'Hauwa Sani'],
  signedOffOn: '2026-08-15',
  summary: 'Foreign currency you earn from an export must come back through a Nigerian bank within the set window.',
  officialChannel: 'Your bank’s trade services desk',
  evidenceExpected: 'Bank credit advice matched to the export invoice',
  sourceCitation: 'CBN Foreign Exchange Manual',
  effectiveOn: '2026-02-01',
  nextReviewOn: '2027-02-15',
  appliesTo: {}
},
{
  id: 'reg-08',
  title: 'Form NXP requirement for export proceeds above threshold',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  sectorCode: '92390',
  status: 'under-review',
  lastReviewedOn: '2026-06-20',
  reviewDue: true,
  version: 1,
  signedOffBy: ['Musa Ibrahim', 'Hauwa Sani'],
  signedOffOn: '2026-06-20',
  summary: 'Larger export receipts may need an export proceeds form lodged with your bank.',
  officialChannel: 'Your bank’s trade services desk',
  evidenceExpected: 'Completed form reference from the bank',
  sourceCitation: 'CBN Foreign Exchange Manual',
  effectiveOn: '2025-09-01',
  nextReviewOn: '2026-09-20',
  appliesTo: {}
},
{
  id: 'reg-09',
  title: 'PCI-DSS attestation for payments-adjacent support engagements',
  category: 'buyer-standard',
  authority: 'Buyer-side procurement standard',
  sectorCode: '85999',
  status: 'current',
  lastReviewedOn: '2026-07-05',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Emeka Obi'],
  signedOffOn: '2026-07-05',
  summary: 'Buyers whose support desks touch card data will ask for a PCI-DSS attestation before onboarding you.',
  officialChannel: 'A PCI-qualified security assessor',
  evidenceExpected: 'Attestation of compliance for your service scope',
  sourceCitation: 'PCI Data Security Standard v4.0',
  effectiveOn: '2025-04-01',
  nextReviewOn: '2027-01-05',
  appliesTo: { modes: ['mode1'] }
},
{
  id: 'reg-10',
  title: 'HIPAA-aligned data handling attestation for telehealth support',
  category: 'buyer-standard',
  authority: 'Buyer-side procurement standard',
  sectorCode: '85120',
  status: 'current',
  lastReviewedOn: '2026-04-22',
  reviewDue: true,
  version: 1,
  signedOffBy: ['Emeka Obi'],
  signedOffOn: '2026-04-22',
  summary: 'US healthcare buyers expect you to sign a business associate agreement and show how patient data is protected.',
  officialChannel: 'Buyer procurement team — business associate agreement',
  evidenceExpected: 'Signed agreement and a data handling attestation',
  sourceCitation: 'US HIPAA Privacy and Security Rules',
  effectiveOn: '2025-10-01',
  nextReviewOn: '2026-07-22',
  appliesTo: { markets: ['us'] }
},
{
  id: 'reg-11',
  title: 'CREST-equivalent accreditation for security assessment engagements',
  category: 'professional',
  authority: 'Buyer-side procurement standard',
  sectorCode: '83131',
  status: 'current',
  lastReviewedOn: '2026-08-09',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Emeka Obi'],
  signedOffOn: '2026-08-09',
  summary: 'Penetration testing buyers in the UK and EU usually require CREST or an equivalent accreditation for the testers on the job.',
  officialChannel: 'CREST or an equivalent accreditation body',
  evidenceExpected: 'Accreditation certificate for the named testers',
  sourceCitation: 'Buyer procurement requirements',
  effectiveOn: '2026-03-01',
  nextReviewOn: '2027-02-09',
  appliesTo: { markets: ['uk', 'eu'] }
},
{
  id: 'reg-12',
  title: 'Diaspora remittance handling — AML/CFT screening conditions',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  status: 'under-review',
  lastReviewedOn: '2026-05-30',
  reviewDue: true,
  version: 1,
  signedOffBy: ['Musa Ibrahim', 'Hauwa Sani'],
  signedOffOn: '2026-05-30',
  summary: 'Payments from diaspora clients go through extra anti-money-laundering screening at your bank.',
  officialChannel: 'Your bank’s compliance desk',
  evidenceExpected: 'Client identity details on the invoice',
  sourceCitation: 'CBN AML/CFT/CPF Regulations',
  effectiveOn: '2025-12-01',
  nextReviewOn: '2026-08-30',
  appliesTo: {}
},
{
  id: 'reg-13',
  title: 'NIN verification for individual service exporters',
  category: 'statutory',
  authority: 'National Identity Management Commission',
  status: 'current',
  lastReviewedOn: '2026-08-20',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Chidi Okafor', 'Segun Alabi'],
  signedOffOn: '2026-08-20',
  summary: 'If you export as an individual rather than a company, your national identification number stands in for CAC registration.',
  officialChannel: 'NIMC — NIN enrolment and verification',
  evidenceExpected: 'NIN slip or verification result matching your account name',
  sourceCitation: 'National Identity Management Commission Act 2007',
  effectiveOn: '2026-09-01',
  nextReviewOn: '2027-03-01',
  appliesTo: { tracks: ['individual'] },
  satisfiedBy: 'nin'
},
{
  id: 'reg-14',
  title: 'Data processing terms for UK and EU clients',
  category: 'buyer-standard',
  authority: 'Buyer-side procurement standard',
  status: 'current',
  lastReviewedOn: '2026-08-28',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Emeka Obi'],
  signedOffOn: '2026-08-28',
  summary: 'UK and EU clients must put a data processing agreement in place before you handle personal data for them remotely.',
  officialChannel: 'Buyer procurement team — data processing agreement',
  evidenceExpected: 'Signed data processing agreement',
  sourceCitation: 'UK GDPR and EU GDPR, Article 28',
  effectiveOn: '2026-01-01',
  nextReviewOn: '2027-01-28',
  appliesTo: { modes: ['mode1'], markets: ['uk', 'eu'] }
},
{
  id: 'reg-15',
  title: 'Domiciliary account for receiving export proceeds',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  status: 'current',
  lastReviewedOn: '2026-08-11',
  reviewDue: false,
  version: 1,
  signedOffBy: ['Musa Ibrahim', 'Hauwa Sani'],
  signedOffOn: '2026-08-11',
  summary: 'Open a foreign currency (domiciliary) account in your own or your company’s name so buyers can pay you directly.',
  officialChannel: 'Any authorised dealer bank',
  evidenceExpected: 'Account confirmation letter from the bank',
  sourceCitation: 'CBN Foreign Exchange Manual',
  effectiveOn: '2026-01-01',
  nextReviewOn: '2027-02-11',
  appliesTo: {}
}];


/** Who signs content off. Buyer-driven standards have no Nigerian competent authority, so the
 * NATEP Secretariat validates them. */
export function signOffAgency(authority: string): string {
  return authority === 'Buyer-side procurement standard' ? 'NATEP Secretariat' : authority;
}

/** REG-02 multi-tier approval "where configured": statutory and FX content needs two different
 * officers at the authority; everything else needs one. */
export function requiredSignOffs(category: RequirementCategory): number {
  return category === 'statutory' || category === 'fx-settlement' ? 2 : 1;
}

export const competentAuthorities: string[] = [
'Central Bank of Nigeria',
'Corporate Affairs Commission',
'Council for the Regulation of Engineering in Nigeria',
'National Identity Management Commission',
'NATEP Secretariat',
'Nigeria Data Protection Commission',
'Nigeria Revenue Service'];

