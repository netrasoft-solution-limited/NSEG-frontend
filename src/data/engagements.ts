import type { EngagementStage } from '../lib/engagementStage';

/** One row per consent-gated referral — links a Shortlist-approved opportunity to the
 * consent grant that authorized disclosing an exporter's profile to that buyer (BRD
 * §3.8 Consented Referral / §3.9 Conversion & Contract Tracking). If the linked consent
 * grant is no longer 'active', the referral's disclosure access must be invalidated
 * regardless of what stage it has reached. */
export interface Engagement {
  id: string;
  opportunityId: string;
  consentGrantId: string;
  stage: EngagementStage;
}

export const engagements: Engagement[] = [
{ id: 'eng-01', opportunityId: 'opp-04', consentGrantId: 'cg-01', stage: 'referral-sent' },
{ id: 'eng-02', opportunityId: 'opp-08', consentGrantId: 'cg-02', stage: 'interview-scheduled' },
{ id: 'eng-03', opportunityId: 'opp-11', consentGrantId: 'cg-03', stage: 'buyer-reviewing' },
{ id: 'eng-04', opportunityId: 'opp-12', consentGrantId: 'cg-04', stage: 'buyer-reviewing' },
{ id: 'eng-05', opportunityId: 'opp-13', consentGrantId: 'cg-05', stage: 'contract-signed' },
{ id: 'eng-06', opportunityId: 'opp-15', consentGrantId: 'cg-06', stage: 'buyer-reviewing' }];
