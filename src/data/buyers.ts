import type { BuyerTierId } from './buyerTiers';
import type { VerificationQueueStatus } from '../lib/verification';

export interface Buyer {
  id: string;
  name: string;
  referenceId: string;
  email: string;
  region: string;
  registeredOn: string;
  tier: BuyerTierId;
  opportunitiesPosted: number;
  verificationQueue: VerificationQueueStatus;
  verificationNote?: string;
}

export const buyers: Buyer[] = [
{
  id: 'byr-01',
  name: 'Nordwind Logistics BV',
  referenceId: 'BYR-26-40021',
  email: 'sourcing@nordwindlogistics.eu',
  region: 'Western Europe',
  registeredOn: 'Jul 3, 2026',
  tier: 'verified-enterprise',
  opportunitiesPosted: 6,
  verificationQueue: 'none'
},
{
  id: 'byr-02',
  name: 'Meridian Holdings Group',
  referenceId: 'BYR-26-40088',
  email: 'procurement@meridianholdings.co.za',
  region: 'Southern Africa',
  registeredOn: 'Jun 21, 2026',
  tier: 'established',
  opportunitiesPosted: 3,
  verificationQueue: 'none'
},
{
  id: 'byr-03',
  name: 'City of Ashbrook Municipal Services',
  referenceId: 'BYR-26-40105',
  email: 'contracts@ashbrookmunicipal.gov',
  region: 'North America',
  registeredOn: 'Aug 25, 2026',
  tier: 'established',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
},
{
  id: 'byr-04',
  name: 'Halcyon BPO Solutions Inc.',
  referenceId: 'BYR-26-40142',
  email: 'vendors@halcyonbpo.com',
  region: 'Western Europe',
  registeredOn: 'Sep 8, 2026',
  tier: 'standard',
  opportunitiesPosted: 1,
  verificationQueue: 'pending',
  verificationNote: 'No match in GLEIF or UK Companies House — AI document fallback awaiting officer confirmation.'
},
{
  id: 'byr-05',
  name: 'Gulfline Freight Partners LLC',
  referenceId: 'BYR-26-40167',
  email: 'ops@gulflinefreight.ae',
  region: 'Gulf States',
  registeredOn: 'Aug 12, 2026',
  tier: 'established',
  opportunitiesPosted: 2,
  verificationQueue: 'none'
},
{
  id: 'byr-06',
  name: 'Cascadia Telehealth Network',
  referenceId: 'BYR-26-40190',
  email: 'partnerships@cascadiatelehealth.com',
  region: 'Western Europe',
  registeredOn: 'Aug 30, 2026',
  tier: 'established',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
},
{
  id: 'byr-07',
  name: 'Sahel Employer Services Ltd',
  referenceId: 'BYR-26-40211',
  email: 'compliance@sahelemployer.co.ke',
  region: 'East Africa',
  registeredOn: 'Jul 30, 2026',
  tier: 'established',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
},
{
  id: 'byr-08',
  name: 'Ferrovia Manufacturing Group',
  referenceId: 'BYR-26-40233',
  email: 'itprocurement@ferroviagroup.com',
  region: 'North America',
  registeredOn: 'Aug 3, 2026',
  tier: 'verified-enterprise',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
},
{
  id: 'byr-09',
  name: 'Kestrel Consumer Brands',
  referenceId: 'BYR-26-40258',
  email: 'marketing@kestrelbrands.co.za',
  region: 'Southern Africa',
  registeredOn: 'Sep 12, 2026',
  tier: 'standard',
  opportunitiesPosted: 1,
  verificationQueue: 'flagged',
  verificationNote: 'Uploaded incorporation certificate failed AI tamper analysis — needs an officer decision.'
},
{
  id: 'byr-10',
  name: 'Dunmore Property Developers',
  referenceId: 'BYR-26-40276',
  email: 'engineering@dunmoredevelopers.ae',
  region: 'Gulf States',
  registeredOn: 'Jul 18, 2026',
  tier: 'established',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
},
{
  id: 'byr-11',
  name: 'Fintrust Remittance Technologies',
  referenceId: 'BYR-26-40299',
  email: 'vendorrisk@fintrustremit.com',
  region: 'North America',
  registeredOn: 'Sep 14, 2026',
  tier: 'standard',
  opportunitiesPosted: 1,
  verificationQueue: 'pending',
  verificationNote: 'TIN validation pending — no match found in connected open registries yet.'
},
{
  id: 'byr-12',
  name: 'Meridian Trading House',
  referenceId: 'BYR-26-40312',
  email: 'treasury@meridiantradinghouse.eu',
  region: 'Western Europe',
  registeredOn: 'Jul 22, 2026',
  tier: 'verified-enterprise',
  opportunitiesPosted: 1,
  verificationQueue: 'none'
}];
