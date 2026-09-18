/**
 * Which specified capability lives where in the console, and the requirement it answers.
 *
 * The console used to carry one menu entry per module, so a reviewer could read coverage off the
 * sidebar. Sections were gathered into seven, which is better to work in but no longer doubles
 * as evidence — this table is that evidence instead. Every id below is cited in the code that
 * implements it; the `source` names that file so a reviewer can go and read it.
 */
export interface CoverageEntry {
  capability: string;
  /** The requirement ids this answers, as cited in the implementing code. */
  requirements: string[];
  /** Where it now lives, as an officer would say it. */
  location: string;
  to: string;
  /** The file carrying the citation. */
  source: string;
}

export const moduleCoverage: CoverageEntry[] = [
{
  capability: 'Exporter registry and capability profile',
  requirements: ['SUP-01'],
  location: 'Registry › Exporters',
  to: '/console/registry/exporters',
  source: 'data/actors.ts'
},
{
  capability: 'Readiness diagnostic and its score bands',
  requirements: ['SUP-05', 'SUP-06'],
  location: 'Registry › Readiness',
  to: '/console/registry/readiness',
  source: 'lib/readinessScore.ts, lib/exporterTier.ts'
},
{
  capability: 'Readiness assertions — purpose-bound, time-stamped, scope-limited',
  requirements: ['REG-05', 'REG-06'],
  location: 'Registry › Readiness',
  to: '/console/registry/readiness',
  source: 'lib/readinessAssertions.ts'
},
{
  capability: 'Evidence vault — verify once, reuse by reference',
  requirements: ['§2.6'],
  location: 'Registry › Evidence',
  to: '/console/registry/evidence',
  source: 'lib/disclosurePackage.ts'
},
{
  capability: 'Sectoral and professional certifications',
  requirements: ['§4.2'],
  location: 'Registry › Evidence › Certifications',
  to: '/console/registry/evidence/certifications',
  source: 'lib/certification.ts'
},
{
  capability: 'Buyer registry and just-in-time verification',
  requirements: ['DEM-01'],
  location: 'Registry › Buyers',
  to: '/console/registry/buyers',
  source: 'lib/buyerWorkspace.ts'
},
{
  capability: 'Delegated access — time-bound, recertified not auto-renewed',
  requirements: ['§2.3'],
  location: 'Registry › Delegated access',
  to: '/console/registry/delegations',
  source: 'data/delegations.ts'
},
{
  capability: 'Demand signals and officer qualification',
  requirements: ['DEM-02'],
  location: 'Opportunities › Signals & shortlists',
  to: '/console/opportunities',
  source: 'data/signals.ts, lib/buyerWorkspace.ts'
},
{
  capability: 'Explainable matching and consent-gated disclosure',
  requirements: ['DEM-09', 'FND-05'],
  location: 'Opportunities › Signals & shortlists',
  to: '/console/opportunities',
  source: 'lib/buyerWorkspace.ts'
},
{
  capability: 'Foreign market entry conditions',
  requirements: ['§3.5'],
  location: 'Opportunities › Market intelligence',
  to: '/console/opportunities/intelligence',
  source: 'data/marketIntelligence.ts'
},
{
  capability: 'Consented referral — access dies with the consent behind it',
  requirements: ['§3.8'],
  location: 'Engagements › Referrals and Consent',
  to: '/console/engagements',
  source: 'data/engagements.ts'
},
{
  capability: 'Conversion and contract tracking',
  requirements: ['§3.9'],
  location: 'Engagements › Referrals',
  to: '/console/engagements',
  source: 'lib/engagementStage.ts'
},
{
  capability: 'Outcome verification and attribution — counted once',
  requirements: ['§3.10'],
  location: 'Engagements › Outcomes',
  to: '/console/engagements/outcomes',
  source: 'data/outcomes.ts, lib/outcomeVerification.ts'
},
{
  capability: 'Incentive sign-off — two-tier, with an independent audit',
  requirements: ['BR-P2-05.3', '§5.4'],
  location: 'Engagements › Incentives',
  to: '/console/engagements/incentives',
  source: 'lib/officerProfile.tsx, lib/incentiveAudit.ts'
},
{
  capability: 'Requirements register — applicability and published versions',
  requirements: ['REG-01', 'REG-02', 'REG-03'],
  location: 'Requirements › Register & authoring',
  to: '/console/requirements',
  source: 'data/regulations.ts, lib/requirementsPathway.ts'
},
{
  capability: 'Authoring with competent-authority sign-off, segregated duties',
  requirements: ['REG-02', '§4'],
  location: 'Requirements › Register & authoring',
  to: '/console/requirements',
  source: 'lib/regulatoryRegister.tsx'
},
{
  capability: 'Change impact — assertions flagged, never voided',
  requirements: ['REG-05'],
  location: 'Requirements › Register & authoring',
  to: '/console/requirements',
  source: 'lib/regulatoryRegister.tsx'
},
{
  capability: 'Controlled vocabularies — versioned, retired not deleted',
  requirements: ['§2.7'],
  location: 'Requirements › Reference data',
  to: '/console/requirements/reference',
  source: 'data/taxonomies.ts'
},
{
  capability: 'Trust ladder — two evidence tracks, stating what was verified',
  requirements: ['D-06', '§3.2'],
  location: 'Requirements › Tiers & badging',
  to: '/console/requirements/tiers',
  source: 'data/trustTiers.ts'
},
{
  capability: 'National Observatory and policy simulation',
  requirements: ['§5.3'],
  location: 'Observatory › National figures',
  to: '/console/observatory',
  source: 'data/policyScenarios.ts, lib/policySimulation.ts'
},
{
  capability: 'Audit trail of every officer decision',
  requirements: ['Module 2'],
  location: 'Observatory › Audit log',
  to: '/console/observatory/audit',
  source: 'lib/auditLog.tsx'
},
{
  capability: 'Officer roles, including read-only audit mode',
  requirements: ['§3.2', 'BR-P2-05.3'],
  location: 'Settings › Profile & role',
  to: '/console/settings',
  source: 'lib/permissions.ts, lib/officerProfile.tsx'
},
{
  capability: 'Exporter privacy — private by default, released by consent',
  requirements: ['REG-04', 'FND-05'],
  location: 'Exporter workspace (outside the console)',
  to: '/workspace',
  source: 'lib/exporterSession.tsx'
}];
