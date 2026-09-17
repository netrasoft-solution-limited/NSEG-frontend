export type EngagementStage =
'package-ready' |
'referral-sent' |
'buyer-reviewing' |
'interview-scheduled' |
'contract-signed' |
'commenced' |
'declined';

export const engagementStageLabels: Record<EngagementStage, string> = {
  'package-ready': 'Package ready',
  'referral-sent': 'Referral sent',
  'buyer-reviewing': 'Buyer reviewing',
  'interview-scheduled': 'Interview scheduled',
  'contract-signed': 'Contract signed',
  commenced: 'Commenced',
  declined: 'Declined'
};

/** BRD 3.8/3.9's referral-to-conversion lifecycle — the ordered path a consented
 * referral advances through. Officers can only step forward one stage at a time. */
const progression: EngagementStage[] = [
'package-ready',
'referral-sent',
'buyer-reviewing',
'interview-scheduled',
'contract-signed',
'commenced'];


export function nextStage(stage: EngagementStage): EngagementStage | null {
  const index = progression.indexOf(stage);
  if (index === -1 || index === progression.length - 1) return null;
  return progression[index + 1];
}

export function isTerminalStage(stage: EngagementStage): boolean {
  return stage === 'commenced' || stage === 'declined';
}
