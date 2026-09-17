export type BuyerTierId = 'standard' | 'established' | 'verified-enterprise';

export interface BuyerTier {
  id: BuyerTierId;
  badge: string;
  unlocked: string[];
}

export const buyerTiers: BuyerTier[] = [
{
  id: 'standard',
  badge: 'Standard Sourcing Partner',
  unlocked: ['Account browsing', 'RFP drafting', 'Platform navigation']
},
{
  id: 'established',
  badge: 'Established Trade Partner',
  unlocked: ['Post public RFPs', 'Receive exporter bids', 'Manage sourcing pipelines']
},
{
  id: 'verified-enterprise',
  badge: 'Verified Enterprise Partner',
  unlocked: ['Priority matching placement', 'Direct talent pool engagement']
}];
