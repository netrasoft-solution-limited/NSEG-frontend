export type BuyerTierId = 'registered' | 'registry-verified' | 'payment-verified';

/** Named for what the desk officer actually confirmed, not how "good" the buyer is. */
export interface BuyerTier {
  id: BuyerTierId;
  badge: string;
  verifies: string;
  unlocked: string[];
  nextStep: string;
}

export const buyerTiers: BuyerTier[] = [
{
  id: 'registered',
  badge: 'Registered',
  verifies: 'Business email confirmed — company not yet checked',
  unlocked: ['Account browsing', 'RFP drafting', 'Platform navigation'],
  nextStep: 'Verify company registration to post public RFPs and receive exporter bids.'
},
{
  id: 'registry-verified',
  badge: 'Registry Verified',
  verifies: 'Company confirmed against its home-country business registry',
  unlocked: ['Post public RFPs', 'Receive exporter bids', 'Manage sourcing pipelines'],
  nextStep: 'Verify a payment instrument to fund escrow-backed engagements.'
},
{
  id: 'payment-verified',
  badge: 'Payment Verified',
  verifies: 'Registry check plus a verified payment instrument for escrow funding',
  unlocked: ['Fund escrow-backed engagements', 'Invite exporters directly'],
  nextStep: 'Keep the payment instrument current — a lapsed check drops this tier.'
}];


export const buyerTierOrder: BuyerTierId[] = buyerTiers.map((tier) => tier.id);
