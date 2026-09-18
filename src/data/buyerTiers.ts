export type BuyerTierId = 'registered' | 'registry-verified' | 'payment-verified';

/** Named for what the desk officer actually confirmed, not how "good" the buyer is. */
export interface BuyerTier {
  id: BuyerTierId;
  badge: string;
  verifies: string;
  accent: 'dim' | 'gate' | 'gold';
  unlocked: string[];
  nextStep: string;
}

export const buyerTiers: BuyerTier[] = [
{
  id: 'registered',
  badge: 'Registered',
  verifies: 'Business email confirmed — company not yet checked',
  accent: 'dim',
  unlocked: ['Draft sourcing requests', 'Browse the marketplace', 'Talk to a desk officer'],
  nextStep: 'Verify your company registration so you can submit requests for officer qualification.'
},
{
  id: 'registry-verified',
  badge: 'Registry Verified',
  verifies: 'Company confirmed against its home-country business registry',
  accent: 'gate',
  unlocked: ['Submit requests for officer qualification', 'Receive officer-approved shortlists', 'Request introductions to exporters'],
  nextStep: 'Verify a payment instrument to fund escrow-backed engagements.'
},
{
  id: 'payment-verified',
  badge: 'Payment Verified',
  verifies: 'Registry check plus a verified payment instrument for escrow funding',
  accent: 'gold',
  unlocked: ['Fund escrow-backed milestones', 'Invite shortlisted exporters directly'],
  nextStep: 'Keep the payment instrument current — a lapsed check drops this tier.'
}];


export const buyerTierOrder: BuyerTierId[] = buyerTiers.map((tier) => tier.id);
