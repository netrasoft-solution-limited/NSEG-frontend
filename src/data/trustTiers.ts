export interface TrustTier {
  id: string;
  badge: string;
  range: string;
  unlocked: string[];
  nextStep: string;
  accent: 'dim' | 'gate' | 'gold';
}

export const trustTiers: TrustTier[] = [
{
  id: 'registered',
  badge: 'Registered Talent / Entity',
  range: '1–39% profile completion',
  unlocked: ['Browse published opportunities', 'Build a capability portfolio', 'Read market access guides'],
  nextStep: 'Verify CAC registration and TIN to start bidding.',
  accent: 'dim'
},
{
  id: 'verified',
  badge: 'NATEP Verified Exporter',
  range: '40–79% profile completion',
  unlocked: ['Bid on opportunities up to $50,000', 'Receive automated match alerts', 'Appear in officer shortlists'],
  nextStep: 'Upload sector regulatory clearance to reach enterprise RFPs.',
  accent: 'gate'
},
{
  id: 'top-rated',
  badge: 'Top-Rated Export Partner',
  range: '80%+ with verified trade history',
  unlocked: ['Unlimited enterprise bidding', 'Priority placement in matching', 'Direct buyer invitations'],
  nextStep: 'Maintain live credentials — expiry downgrades the badge automatically.',
  accent: 'gold'
}];