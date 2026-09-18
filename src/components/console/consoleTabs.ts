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


/** The officer's own account, and what the console covers against the specification. */
export const settingsTabs: ConsoleTab[] = [
{ to: '/console/settings', label: 'Profile & notifications', end: true },
{ to: '/console/settings/coverage', label: 'Module coverage' }];


/** Demand as it arrives, and the market conditions an officer qualifies it against. */
export const opportunityTabs: ConsoleTab[] = [
{ to: '/console/opportunities', label: 'Qualification queue', end: true },
{ to: '/console/opportunities/records', label: 'Opportunities' },
{ to: '/console/opportunities/shortlists', label: 'Shortlists' },
{ to: '/console/opportunities/intelligence', label: 'Market intelligence' }];


/** What the Gateway publishes as rules, and the vocabularies and ladders those rules use.
 * Authoring stays on one page with the register: the draft editor holds unsaved content. */
export const requirementTabs: ConsoleTab[] = [
{ to: '/console/requirements', label: 'Register & authoring', end: true },
{ to: '/console/requirements/reference', label: 'Reference data' },
{ to: '/console/requirements/tiers', label: 'Tiers & badging' }];


/** The national picture, and the trail of decisions behind it. */
export const observatoryTabs: ConsoleTab[] = [
{ to: '/console/observatory', label: 'National figures', end: true },
{ to: '/console/observatory/audit', label: 'Audit log' }];


/** A case runs consent → referral → outcome, and the verified value is what unlocks an
 * incentive, so the four sit in that order. */
export const engagementTabs: ConsoleTab[] = [
{ to: '/console/engagements', label: 'Referrals', end: true },
{ to: '/console/engagements/consent', label: 'Consent' },
{ to: '/console/engagements/outcomes', label: 'Outcomes' },
{ to: '/console/engagements/incentives', label: 'Incentives' }];
