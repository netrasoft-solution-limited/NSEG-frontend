import type { EvidenceKey, ExporterTierId, ExporterTrack } from './trustTiers';
import type { VerificationQueueStatus } from '../lib/verification';
import type { ReadinessParameterScores } from '../lib/readinessScore';
import { deriveExporterTier } from '../lib/exporterTier';
import type { SupplyModeId, TargetMarketId } from './regulations';

export type { VerificationQueueStatus };

/** SUP-01 capability profile captured at onboarding. Private by default. */
export interface CapabilityProfile {
  modes: SupplyModeId[];
  markets: TargetMarketId[];
  teamSize: string;
  description: string;
}

export interface ActorRecord {
  id: string;
  name: string;
  email: string;
  /** D-04: the character after "NT-" is the entity type — B for a firm, I for an individual. */
  natepId: string;
  track: ExporterTrack;
  /** Primary service sector (UN CPC code from sectors.ts). */
  sectorCode: string;
  registeredOn: string;
  lastActiveDaysAgo: number;
  matchCount: number;
  suspended: boolean;
  /** Registered within the last 7 days — drives the "New this week" stat, kept as an
   * explicit flag rather than computed from `registeredOn` so this static demo dataset
   * never goes stale relative to the real device clock. */
  isNew: boolean;
  /** Evidence an officer or registry has confirmed — self-declared items don't count. */
  verifiedEvidence: EvidenceKey[];
  /** Latest readiness diagnostic (SUP-05), 0–100 per parameter. */
  diagnostic: ReadinessParameterScores;
  verificationQueue: VerificationQueueStatus;
  /** Reason surfaced to the reviewing officer when verificationQueue isn't 'none'. */
  verificationNote?: string;
  /** Days until a verified sector credential lapses — kept relative rather than an
   * absolute date for the same reason as `isNew`, so the demo dataset doesn't drift
   * into "expired" once the real clock moves past whatever date this was authored on.
   * Surfaced as a renewal warning starting 30 days out. */
  credentialExpiresInDays?: number;
  /** Evidence submitted at onboarding and waiting for a registry check. */
  pendingEvidence?: EvidenceKey[];
  capability?: CapabilityProfile;
}

export interface Actor extends ActorRecord {
  /** Derived, never stored — see lib/exporterTier.ts. */
  tier: ExporterTierId;
}

const actorRecords: ActorRecord[] = [
{
  id: 'act-01',
  name: 'Apex Software Global',
  email: 'contact@apexsoftware.ng',
  natepId: 'NT-B26-94821',
  track: 'firm',
  sectorCode: '83131',
  registeredOn: 'Jun 2, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 42,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin'],
  diagnostic: { exportCapacity: 70, financialStability: 68, qualitySystems: 65, crossBorderExperience: 66, legalIpProtection: 70 },
  verificationQueue: 'none'
},
{
  id: 'act-02',
  name: 'Lagos Delivery Collective',
  email: 'ops@lagosdelivery.ng',
  natepId: 'NT-B26-11029',
  track: 'firm',
  sectorCode: '92390',
  registeredOn: 'May 14, 2026',
  lastActiveDaysAgo: 1,
  matchCount: 28,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin'],
  diagnostic: { exportCapacity: 85, financialStability: 80, qualitySystems: 78, crossBorderExperience: 80, legalIpProtection: 80 },
  verificationQueue: 'none'
},
{
  id: 'act-03',
  name: 'Abuja Analytics Partners',
  email: 'hello@abujaanalytics.ng',
  natepId: 'NT-B26-55402',
  track: 'firm',
  sectorCode: '86601',
  registeredOn: 'Feb 20, 2026',
  lastActiveDaysAgo: 2,
  matchCount: 61,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin', 'delivery-history'],
  diagnostic: { exportCapacity: 92, financialStability: 90, qualitySystems: 88, crossBorderExperience: 92, legalIpProtection: 94 },
  verificationQueue: 'none',
  credentialExpiresInDays: 16
},
{
  id: 'act-04',
  name: 'Northbridge Consulting NG',
  email: 'team@northbridge.ng',
  natepId: 'NT-B26-70213',
  track: 'firm',
  sectorCode: '83111',
  registeredOn: 'Sep 10, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 3,
  suspended: false,
  isNew: true,
  verifiedEvidence: ['tin'],
  diagnostic: { exportCapacity: 60, financialStability: 55, qualitySystems: 55, crossBorderExperience: 60, legalIpProtection: 60 },
  verificationQueue: 'pending',
  verificationNote: 'CAC registry lookup returned no match — AI document fallback awaiting officer confirmation.'
},
{
  id: 'act-05',
  name: 'Kaduna Textile Exports',
  email: 'export@kadunatextile.ng',
  natepId: 'NT-B26-30871',
  track: 'firm',
  sectorCode: '82191',
  registeredOn: 'Jan 15, 2026',
  lastActiveDaysAgo: 4,
  matchCount: 88,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin', 'delivery-history'],
  diagnostic: { exportCapacity: 95, financialStability: 90, qualitySystems: 90, crossBorderExperience: 92, legalIpProtection: 90 },
  verificationQueue: 'none',
  credentialExpiresInDays: 12
},
{
  id: 'act-06',
  name: 'Zenith Freight Partners',
  email: 'info@zenithfreight.ng',
  natepId: 'NT-B26-48210',
  track: 'firm',
  sectorCode: '92390',
  registeredOn: 'Jul 1, 2026',
  lastActiveDaysAgo: 12,
  matchCount: 9,
  suspended: true,
  isNew: false,
  verifiedEvidence: ['cac', 'tin'],
  diagnostic: { exportCapacity: 55, financialStability: 52, qualitySystems: 50, crossBorderExperience: 58, legalIpProtection: 60 },
  verificationQueue: 'none'
},
{
  id: 'act-07',
  name: 'Ibadan Creative Studio',
  email: 'studio@ibadancreative.ng',
  natepId: 'NT-B26-90144',
  track: 'firm',
  sectorCode: '82191',
  registeredOn: 'Sep 12, 2026',
  lastActiveDaysAgo: 1,
  matchCount: 4,
  suspended: false,
  isNew: true,
  verifiedEvidence: ['cac'],
  diagnostic: { exportCapacity: 50, financialStability: 45, qualitySystems: 40, crossBorderExperience: 45, legalIpProtection: 50 },
  verificationQueue: 'pending',
  verificationNote: 'TIN validation pending — no match found in connected open registries yet.'
},
{
  id: 'act-08',
  name: 'Riverside BPO Hub',
  email: 'contact@riversidebpo.ng',
  natepId: 'NT-B26-63357',
  track: 'firm',
  sectorCode: '85999',
  registeredOn: 'Apr 18, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 54,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin', 'delivery-history'],
  diagnostic: { exportCapacity: 90, financialStability: 88, qualitySystems: 85, crossBorderExperience: 88, legalIpProtection: 88 },
  verificationQueue: 'none'
},
{
  id: 'act-09',
  name: 'Coastal Legal Advisory',
  email: 'advisory@coastallegal.ng',
  natepId: 'NT-B26-20938',
  track: 'firm',
  sectorCode: '92190',
  registeredOn: 'Aug 2, 2026',
  lastActiveDaysAgo: 6,
  matchCount: 2,
  suspended: false,
  isNew: false,
  verifiedEvidence: [],
  diagnostic: { exportCapacity: 40, financialStability: 35, qualitySystems: 35, crossBorderExperience: 40, legalIpProtection: 45 },
  verificationQueue: 'flagged',
  verificationNote: 'AI document check failed tamper analysis on the uploaded incorporation certificate — needs an officer decision.'
},
{
  id: 'act-10',
  name: 'Savannah Healthtech Ltd',
  email: 'contact@savannahhealthtech.ng',
  natepId: 'NT-B25-11567',
  track: 'firm',
  sectorCode: '85120',
  registeredOn: 'Nov 30, 2025',
  lastActiveDaysAgo: 3,
  matchCount: 103,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['cac', 'tin', 'delivery-history'],
  diagnostic: { exportCapacity: 98, financialStability: 97, qualitySystems: 98, crossBorderExperience: 99, legalIpProtection: 98 },
  verificationQueue: 'none',
  credentialExpiresInDays: 4
},
{
  id: 'act-11',
  name: 'Delta Engineering Works',
  email: 'projects@deltaengineering.ng',
  natepId: 'NT-B26-77630',
  track: 'firm',
  sectorCode: '86601',
  registeredOn: 'Mar 22, 2026',
  lastActiveDaysAgo: 20,
  matchCount: 15,
  suspended: true,
  isNew: false,
  verifiedEvidence: ['cac', 'tin'],
  diagnostic: { exportCapacity: 62, financialStability: 60, qualitySystems: 58, crossBorderExperience: 64, legalIpProtection: 62 },
  verificationQueue: 'none'
},
{
  id: 'act-12',
  name: 'Plateau Media Collective',
  email: 'studio@plateaumedia.ng',
  natepId: 'NT-B26-40982',
  track: 'firm',
  sectorCode: '82191',
  registeredOn: 'Jul 25, 2026',
  lastActiveDaysAgo: 9,
  matchCount: 6,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['tin'],
  diagnostic: { exportCapacity: 55, financialStability: 50, qualitySystems: 48, crossBorderExperience: 50, legalIpProtection: 55 },
  verificationQueue: 'pending',
  verificationNote: 'CAC registration number submitted — pending manual confirmation against the corporate registry.'
},
{
  id: 'act-13',
  name: 'Chiamaka Obi',
  email: 'chiamaka.obi@researchmail.ng',
  natepId: 'NT-I26-38417',
  track: 'individual',
  sectorCode: '83131',
  registeredOn: 'Aug 18, 2026',
  lastActiveDaysAgo: 0,
  matchCount: 11,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['nin', 'professional-credential'],
  diagnostic: { exportCapacity: 66, financialStability: 60, qualitySystems: 62, crossBorderExperience: 68, legalIpProtection: 64 },
  verificationQueue: 'none'
},
{
  id: 'act-14',
  name: 'Tunde Bakare',
  email: 'tunde@bakaredata.ng',
  natepId: 'NT-I26-51092',
  track: 'individual',
  sectorCode: '83131',
  registeredOn: 'Sep 13, 2026',
  lastActiveDaysAgo: 1,
  matchCount: 2,
  suspended: false,
  isNew: true,
  verifiedEvidence: ['nin'],
  diagnostic: { exportCapacity: 74, financialStability: 70, qualitySystems: 68, crossBorderExperience: 72, legalIpProtection: 70 },
  verificationQueue: 'pending',
  verificationNote: 'Professional credential submitted — awaiting confirmation from the issuing body.'
},
{
  id: 'act-15',
  name: 'Halima Yusuf',
  email: 'halima@yusuflocalisation.ng',
  natepId: 'NT-I25-20476',
  track: 'individual',
  sectorCode: '82191',
  registeredOn: 'Dec 9, 2025',
  lastActiveDaysAgo: 2,
  matchCount: 37,
  suspended: false,
  isNew: false,
  verifiedEvidence: ['nin', 'professional-credential', 'delivery-history'],
  diagnostic: { exportCapacity: 84, financialStability: 80, qualitySystems: 82, crossBorderExperience: 88, legalIpProtection: 82 },
  verificationQueue: 'none',
  credentialExpiresInDays: 25
}];


export function toActor(record: ActorRecord): Actor {
  return { ...record, tier: deriveExporterTier(record).id };
}

export const actors: Actor[] = actorRecords.map(toActor);
