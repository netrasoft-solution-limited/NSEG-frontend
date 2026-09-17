import type { ConsoleTab } from './ConsoleLayout';

/**
 * Sub-pages of each console section. Kept beside the layout rather than in the pages, so a
 * section's shape is stated once — the same convention as profileTabs in
 * components/workspace/WorkspaceLayout.tsx.
 */

/** Who the Gateway holds records about, and what is held about them. Certifications sit under
 * Evidence because they are a subset of the vault, not a separate store (BRD §4.2). */
export const registryTabs: ConsoleTab[] = [
{ to: '/console/registry/exporters', label: 'Exporters' },
{ to: '/console/registry/buyers', label: 'Buyers' },
{ to: '/console/registry/readiness', label: 'Readiness' },
{ to: '/console/registry/evidence', label: 'Evidence', end: true },
{ to: '/console/registry/evidence/certifications', label: 'Certifications' },
{ to: '/console/registry/delegations', label: 'Delegated access' }];


/** A case runs consent → referral → outcome, and the verified value is what unlocks an
 * incentive, so the four sit in that order. */
export const engagementTabs: ConsoleTab[] = [
{ to: '/console/engagements', label: 'Referrals', end: true },
{ to: '/console/engagements/consent', label: 'Consent' },
{ to: '/console/engagements/outcomes', label: 'Outcomes' },
{ to: '/console/engagements/incentives', label: 'Incentives' }];
