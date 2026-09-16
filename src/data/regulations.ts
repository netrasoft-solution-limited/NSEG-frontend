export type RequirementCategory = 'statutory' | 'professional' | 'fiscal' | 'fx-settlement' | 'buyer-standard';
export type RequirementStatus = 'current' | 'under-review' | 'superseded';

export interface RegulatoryRequirement {
  id: string;
  title: string;
  category: RequirementCategory;
  authority: string;
  sectorCode?: string;
  status: RequirementStatus;
  lastReviewedOn: string;
  reviewDue: boolean;
}

export const requirementCategoryLabels: Record<RequirementCategory, string> = {
  statutory: 'Statutory',
  professional: 'Professional',
  fiscal: 'Fiscal',
  'fx-settlement': 'FX / Settlement',
  'buyer-standard': 'Buyer-driven standard'
};

export const regulatoryRequirements: RegulatoryRequirement[] = [
{
  id: 'reg-01',
  title: 'CAC registration currency for service exporters',
  category: 'statutory',
  authority: 'Corporate Affairs Commission',
  status: 'current',
  lastReviewedOn: '2026-07-12',
  reviewDue: false
},
{
  id: 'reg-02',
  title: 'NDPA cross-border data transfer conditions',
  category: 'statutory',
  authority: 'Nigeria Data Protection Commission',
  sectorCode: '83131',
  status: 'under-review',
  lastReviewedOn: '2026-06-02',
  reviewDue: true
},
{
  id: 'reg-03',
  title: 'Professional indemnity cover threshold — advisory services',
  category: 'professional',
  authority: 'NATEP Secretariat',
  sectorCode: '83111',
  status: 'current',
  lastReviewedOn: '2026-08-01',
  reviewDue: false
},
{
  id: 'reg-04',
  title: 'Licensed structural engineer of record requirement',
  category: 'professional',
  authority: 'Council for the Regulation of Engineering in Nigeria',
  sectorCode: '86601',
  status: 'current',
  lastReviewedOn: '2026-05-19',
  reviewDue: true
},
{
  id: 'reg-05',
  title: 'Tax identification number verification for cross-border invoicing',
  category: 'fiscal',
  authority: 'Nigeria Revenue Service',
  status: 'current',
  lastReviewedOn: '2026-07-28',
  reviewDue: false
},
{
  id: 'reg-06',
  title: 'Withholding tax treatment for exported professional services',
  category: 'fiscal',
  authority: 'Nigeria Revenue Service',
  sectorCode: '83111',
  status: 'superseded',
  lastReviewedOn: '2026-03-14',
  reviewDue: false
},
{
  id: 'reg-07',
  title: 'FX repatriation window for service export receivables',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  status: 'current',
  lastReviewedOn: '2026-08-15',
  reviewDue: false
},
{
  id: 'reg-08',
  title: 'Form NXP requirement for export proceeds above threshold',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  sectorCode: '92390',
  status: 'under-review',
  lastReviewedOn: '2026-06-20',
  reviewDue: true
},
{
  id: 'reg-09',
  title: 'PCI-DSS attestation for payments-adjacent support engagements',
  category: 'buyer-standard',
  authority: 'Buyer-side procurement standard',
  sectorCode: '85999',
  status: 'current',
  lastReviewedOn: '2026-07-05',
  reviewDue: false
},
{
  id: 'reg-10',
  title: 'HIPAA-aligned data handling attestation for telehealth support',
  category: 'buyer-standard',
  authority: 'Buyer-side procurement standard',
  sectorCode: '85120',
  status: 'current',
  lastReviewedOn: '2026-04-22',
  reviewDue: true
},
{
  id: 'reg-11',
  title: 'CREST-equivalent accreditation for security assessment engagements',
  category: 'professional',
  authority: 'Buyer-side procurement standard',
  sectorCode: '83131',
  status: 'current',
  lastReviewedOn: '2026-08-09',
  reviewDue: false
},
{
  id: 'reg-12',
  title: 'Diaspora remittance handling — AML/CFT screening conditions',
  category: 'fx-settlement',
  authority: 'Central Bank of Nigeria',
  status: 'under-review',
  lastReviewedOn: '2026-05-30',
  reviewDue: true
}];
