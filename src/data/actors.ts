import type { TrustTier } from './trustTiers';
import type { VerificationQueueStatus } from '../lib/verification';

export type { VerificationQueueStatus };

export interface Actor {
  id: string;
  name: string;
  email: string;
  natepId: string;
  registeredOn: string;
  lastActiveDaysAgo: number;
  matchCount: number;
  tier: TrustTier['id'];
  suspended: boolean;
  /** Registered within the last 7 days — drives the "New this week" stat, kept as an
   * explicit flag rather than computed from `registeredOn` so this static demo dataset
   * never goes stale relative to the real device clock. */
  isNew: boolean;
  /** Weighted profile completion (40% data completeness, 60% verification depth) — the
   * metric that drives trust-tier progression. */
  profileCompletion: number;
  verificationQueue: VerificationQueueStatus;
  /** Reason surfaced to the reviewing officer when verificationQueue isn't 'none'. */
  verificationNote?: string;
  /** Days until a verified sector credential lapses — kept relative rather than an
   * absolute date for the same reason as `isNew`, so the demo dataset doesn't drift
   * into "expired" once the real clock moves past whatever date this was authored on.
   * Surfaced as a renewal warning starting 30 days out. */
  credentialExpiresInDays?: number;
}

export const actors: Actor[] = [
{
  id: 'act-01',
  name: 'Apex Software Global',
  email: 'contact@apexsoftware.ng',
  natepId: 'NT-B26-94821',
  registeredOn: 'Jun 2, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 42,
  tier: 'verified',
  suspended: false,
  isNew: false,
  profileCompletion: 68,
  verificationQueue: 'none'
},
{
  id: 'act-02',
  name: 'Lagos Delivery Collective',
  email: 'ops@lagosdelivery.ng',
  natepId: 'NT-B26-11029',
  registeredOn: 'May 14, 2026',
  lastActiveDaysAgo: 1,
  matchCount: 28,
  tier: 'verified',
  suspended: false,
  isNew: false,
  profileCompletion: 72,
  verificationQueue: 'none'
},
{
  id: 'act-03',
  name: 'Abuja Analytics Partners',
  email: 'hello@abujaanalytics.ng',
  natepId: 'NT-B26-55402',
  registeredOn: 'Feb 20, 2026',
  lastActiveDaysAgo: 2,
  matchCount: 61,
  tier: 'top-rated',
  suspended: false,
  isNew: false,
  profileCompletion: 91,
  verificationQueue: 'none',
  credentialExpiresInDays: 16
},
{
  id: 'act-04',
  name: 'Northbridge Consulting NG',
  email: 'team@northbridge.ng',
  natepId: 'NT-B26-70213',
  registeredOn: 'Sep 10, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 3,
  tier: 'registered',
  suspended: false,
  isNew: true,
  profileCompletion: 22,
  verificationQueue: 'pending',
  verificationNote: 'CAC registry lookup returned no match — AI document fallback awaiting officer confirmation.'
},
{
  id: 'act-05',
  name: 'Kaduna Textile Exports',
  email: 'export@kadunatextile.ng',
  natepId: 'NT-B26-30871',
  registeredOn: 'Jan 15, 2026',
  lastActiveDaysAgo: 4,
  matchCount: 88,
  tier: 'top-rated',
  suspended: false,
  isNew: false,
  profileCompletion: 95,
  verificationQueue: 'none',
  credentialExpiresInDays: 12
},
{
  id: 'act-06',
  name: 'Zenith Freight Partners',
  email: 'info@zenithfreight.ng',
  natepId: 'NT-B26-48210',
  registeredOn: 'Jul 1, 2026',
  lastActiveDaysAgo: 12,
  matchCount: 9,
  tier: 'verified',
  suspended: true,
  isNew: false,
  profileCompletion: 55,
  verificationQueue: 'none'
},
{
  id: 'act-07',
  name: 'Ibadan Creative Studio',
  email: 'studio@ibadancreative.ng',
  natepId: 'NT-B26-90144',
  registeredOn: 'Sep 12, 2026',
  lastActiveDaysAgo: 1,
  matchCount: 4,
  tier: 'registered',
  suspended: false,
  isNew: true,
  profileCompletion: 18,
  verificationQueue: 'pending',
  verificationNote: 'TIN validation pending — no match found in connected open registries yet.'
},
{
  id: 'act-08',
  name: 'Riverside BPO Hub',
  email: 'contact@riversidebpo.ng',
  natepId: 'NT-B26-63357',
  registeredOn: 'Apr 18, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 54,
  tier: 'verified',
  suspended: false,
  isNew: false,
  profileCompletion: 76,
  verificationQueue: 'none'
},
{
  id: 'act-09',
  name: 'Coastal Legal Advisory',
  email: 'advisory@coastallegal.ng',
  natepId: 'NT-B26-20938',
  registeredOn: 'Aug 2, 2026',
  lastActiveDaysAgo: 6,
  matchCount: 2,
  tier: 'registered',
  suspended: false,
  isNew: false,
  profileCompletion: 34,
  verificationQueue: 'flagged',
  verificationNote: 'AI document check failed tamper analysis on the uploaded incorporation certificate — needs an officer decision.'
},
{
  id: 'act-10',
  name: 'Savannah Healthtech Ltd',
  email: 'contact@savannahhealthtech.ng',
  natepId: 'NT-B25-11567',
  registeredOn: 'Nov 30, 2025',
  lastActiveDaysAgo: 3,
  matchCount: 103,
  tier: 'top-rated',
  suspended: false,
  isNew: false,
  profileCompletion: 98,
  verificationQueue: 'none',
  credentialExpiresInDays: 4
},
{
  id: 'act-11',
  name: 'Delta Engineering Works',
  email: 'projects@deltaengineering.ng',
  natepId: 'NT-B26-77630',
  registeredOn: 'Mar 22, 2026',
  lastActiveDaysAgo: 20,
  matchCount: 15,
  tier: 'verified',
  suspended: true,
  isNew: false,
  profileCompletion: 61,
  verificationQueue: 'none'
},
{
  id: 'act-12',
  name: 'Plateau Media Collective',
  email: 'studio@plateaumedia.ng',
  natepId: 'NT-B26-40982',
  registeredOn: 'Jul 25, 2026',
  lastActiveDaysAgo: 9,
  matchCount: 6,
  tier: 'registered',
  suspended: false,
  isNew: false,
  profileCompletion: 27,
  verificationQueue: 'pending',
  verificationNote: 'CAC registration number submitted — pending manual confirmation against the corporate registry.'
}];
