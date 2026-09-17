import type { ConsoleTab } from './ConsoleLayout';

/**
 * Sub-pages of each console section. Kept beside the layout rather than in the pages, so a
 * section's shape is stated once — the same convention as profileTabs in
 * components/workspace/WorkspaceLayout.tsx.
 */

/** A case runs consent → referral → outcome, and the verified value is what unlocks an
 * incentive, so the four sit in that order. */
export const engagementTabs: ConsoleTab[] = [
{ to: '/console/engagements', label: 'Referrals', end: true },
{ to: '/console/engagements/consent', label: 'Consent' },
{ to: '/console/engagements/outcomes', label: 'Outcomes' },
{ to: '/console/engagements/incentives', label: 'Incentives' }];
