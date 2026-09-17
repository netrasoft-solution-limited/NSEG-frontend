export type BuyerTierId = 'standard' | 'established' | 'verified-enterprise';

export interface BuyerTier {
  id: BuyerTierId;
  badge: string;
  unlocked: string[];
  nextStep: string;
}

export const buyerTiers: BuyerTier[] = [
{
  id: 'standard',
  badge: 'Standard Sourcing Partner',
  unlocked: ['Account browsing', 'RFP drafting', 'Platform navigation'],
  nextStep: 'Verify company registration to post public RFPs and receive exporter bids.'
},
{
  id: 'established',
  badge: 'Established Trade Partner',
  unlocked: ['Post public RFPs', 'Receive exporter bids', 'Manage sourcing pipelines'],
  nextStep: 'Complete enterprise payment verification to unlock priority matching placement.'
},
{
  id: 'verified-enterprise',
  badge: 'Verified Enterprise Partner',
  unlocked: ['Priority matching placement', 'Direct talent pool engagement'],
  nextStep: 'Maintain verified status — a lapsed verification drops priority placement.'
}];
