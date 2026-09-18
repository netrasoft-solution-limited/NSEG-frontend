export type ExporterTierId = 'registered' | 'identity-verified' | 'delivery-verified';

/** PRD D-06: one ladder, two evidence tracks. A firm proves identity with CAC + TIN; an
 * individual (no CAC) proves it with NIN + a professional credential. */
export type ExporterTrack = 'firm' | 'individual';

export type EvidenceKey = 'cac' | 'tin' | 'nin' | 'professional-credential' | 'delivery-history';

export const evidenceLabels: Record<EvidenceKey, string> = {
  cac: 'CAC registration',
  tin: 'Tax identification number',
  nin: 'National identification number',
  'professional-credential': 'Professional credential',
  'delivery-history': 'Verified delivery history'
};

export const trackLabels: Record<ExporterTrack, string> = {
  firm: 'Registered firm',
  individual: 'Individual professional'
};

/** Tier names state what was verified — never a judgement of work quality (PRD §3.2). An
 * exporter holds the highest tier whose diagnostic floor AND evidence are both met; the
 * thresholds live here as data so policy can move them without a code change. */
export interface TrustTier {
  id: ExporterTierId;
  badge: string;
  /** One line on what reaching this tier actually proves. */
  verifies: string;
  /** Minimum readiness diagnostic score (SUP-05 bands). */
  minDiagnostic: number;
  evidence: Record<ExporterTrack, EvidenceKey[]>;
  unlocked: string[];
  nextStep: string;
  accent: 'dim' | 'gate' | 'gold';
}

export const trustTiers: TrustTier[] = [
{
  id: 'registered',
  badge: 'Registered',
  verifies: 'An account exists — nothing has been verified yet',
  minDiagnostic: 0,
  evidence: { firm: [], individual: [] },
  unlocked: ['Browse published opportunities', 'Take the readiness diagnostic', 'Use the requirements wizard'],
  nextStep: 'Verify your identity (CAC + TIN, or NIN + a professional credential) and reach a diagnostic score of 50.',
  accent: 'dim'
},
{
  id: 'identity-verified',
  badge: 'Identity Verified',
  verifies: 'Identity confirmed against official registries · diagnostic 50+',
  minDiagnostic: 50,
  evidence: { firm: ['cac', 'tin'], individual: ['nin', 'professional-credential'] },
  unlocked: ['Bid on opportunities up to $50,000', 'Receive match alerts', 'Appear in officer shortlists'],
  nextStep: 'Have a completed engagement verified and reach a diagnostic score of 80.',
  accent: 'gate'
},
{
  id: 'delivery-verified',
  badge: 'Delivery Verified',
  verifies: 'Identity plus at least one cross-border delivery confirmed · diagnostic 80+',
  minDiagnostic: 80,
  evidence: {
    firm: ['cac', 'tin', 'delivery-history'],
    individual: ['nin', 'professional-credential', 'delivery-history']
  },
  unlocked: ['Bid with no contract value ceiling', 'Receive direct buyer invitations', 'See full opportunity terms'],
  nextStep: 'Keep credentials current — a lapsed credential drops this tier until it is renewed.',
  accent: 'gold'
}];


export const exporterTierOrder: ExporterTierId[] = trustTiers.map((tier) => tier.id);
