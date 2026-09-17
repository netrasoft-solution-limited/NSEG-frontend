export type ConsentStatus = 'active' | 'revoked' | 'expired';

export interface ConsentGrant {
  id: string;
  actorId: string;
  recipient: string;
  purpose: string;
  fieldsDisclosed: string[];
  grantedOn: string;
  status: ConsentStatus;
  linkedOpportunityId?: string;
}

export const consentGrants: ConsentGrant[] = [
{
  id: 'cg-01',
  actorId: 'act-08',
  recipient: 'Halcyon BPO Solutions Inc.',
  purpose: 'Shortlist disclosure for multilingual customer support pilot',
  fieldsDisclosed: ['Company profile', 'Verified certifications', 'Trade references'],
  grantedOn: '2026-08-04',
  status: 'active',
  linkedOpportunityId: 'opp-04'
},
{
  id: 'cg-02',
  actorId: 'act-01',
  recipient: 'Ferrovia Manufacturing Group',
  purpose: 'Shortlist disclosure for enterprise data migration advisory',
  fieldsDisclosed: ['Company profile', 'Case studies', 'Team qualifications'],
  grantedOn: '2026-08-16',
  status: 'active',
  linkedOpportunityId: 'opp-08'
},
{
  id: 'cg-03',
  actorId: 'act-12',
  recipient: 'Fintrust Remittance Technologies',
  purpose: 'Referral for diaspora remittance app support desk',
  fieldsDisclosed: ['Company profile', 'PCI-DSS attestation'],
  grantedOn: '2026-07-29',
  status: 'active',
  linkedOpportunityId: 'opp-11'
},
{
  id: 'cg-04',
  actorId: 'act-09',
  recipient: 'Meridian Trading House',
  purpose: 'Referral for FX hedging advisory engagement',
  fieldsDisclosed: ['Company profile', 'Regulatory clearance'],
  grantedOn: '2026-07-23',
  status: 'revoked',
  linkedOpportunityId: 'opp-12'
},
{
  id: 'cg-05',
  actorId: 'act-10',
  recipient: 'Ferrovia Manufacturing Group',
  purpose: 'Directly-invited proposal for enterprise cloud security assessment',
  fieldsDisclosed: ['Company profile', 'CREST accreditation', 'Financial services references'],
  grantedOn: '2026-08-12',
  status: 'active',
  linkedOpportunityId: 'opp-13'
},
{
  id: 'cg-06',
  actorId: 'act-05',
  recipient: 'Meridian Holdings Group',
  purpose: 'Directly-invited proposal for continental logistics network optimisation',
  fieldsDisclosed: ['Company profile', 'Multi-country delivery history'],
  grantedOn: '2026-07-31',
  status: 'expired',
  linkedOpportunityId: 'opp-15'
},
{
  id: 'cg-07',
  actorId: 'act-03',
  recipient: 'Nordwind Logistics BV',
  purpose: 'Market intelligence briefing on Western Europe logistics demand',
  fieldsDisclosed: ['Company profile'],
  grantedOn: '2026-06-10',
  status: 'active'
}];
