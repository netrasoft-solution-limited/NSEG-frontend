import type { Buyer } from '../data/buyers';
import { buyerTiers, type BuyerTier } from '../data/buyerTiers';
import { opportunities, type Opportunity } from '../data/opportunities';
import { engagements, type Engagement } from '../data/engagements';
import { shortlists, type ShortlistCandidate } from '../data/shortlists';
import { consentGrants } from '../data/consentGrants';
import { actors, type Actor } from '../data/actors';
import type { IntroductionRequest } from './gatewayExchange';

export interface BuyerStanding {
  tier: BuyerTier;
  next?: BuyerTier;
  /** SUP-06's mirror for buyers: the one thing that moves them up. */
  nextAction: string;
  /** True while an officer is already checking the next tier's evidence. */
  checkInProgress: boolean;
}

export function buyerStanding(buyer: Buyer): BuyerStanding {
  const tier = buyerTiers.find((item) => item.id === buyer.tier)!;
  const next = buyerTiers[buyerTiers.indexOf(tier) + 1];
  const checkInProgress = buyer.verificationQueue !== 'none';

  let nextAction: string;
  if (!next) {
    nextAction = tier.nextStep;
  } else if (checkInProgress) {
    nextAction = `A desk officer is checking your details for ${next.badge}. ${buyer.verificationNote ?? ''}`.trim();
  } else {
    nextAction = tier.nextStep;
  }
  return { tier, next, nextAction, checkInProgress };
}

/** DEM-01 just-in-time verification: a buyer can explore and draft freely, and is asked to
 * verify only at the moment an action needs it. */
export function canSubmitRequests(buyer: Buyer): boolean {
  return buyer.tier !== 'registered';
}

/** DEM-02, as the buyer sees it. Drafts and awaiting-qualification only exist in session. */
export type RequestStatus = 'draft' | 'awaiting-qualification' | 'published' | 'shortlisting' | 'engaging' | 'in-delivery';

export const requestStatusSteps: { id: RequestStatus; label: string }[] = [
{ id: 'draft', label: 'Draft' },
{ id: 'awaiting-qualification', label: 'Officer review' },
{ id: 'published', label: 'Published' },
{ id: 'shortlisting', label: 'Shortlist' },
{ id: 'engaging', label: 'Introductions' },
{ id: 'in-delivery', label: 'In delivery' }];


export function buyerOpportunities(buyer: Buyer): Opportunity[] {
  return opportunities.filter((opportunity) => opportunity.buyerId === buyer.id);
}

export function buyerEngagements(buyer: Buyer): Engagement[] {
  const ids = new Set(buyerOpportunities(buyer).map((opportunity) => opportunity.id));
  return engagements.filter((engagement) => ids.has(engagement.opportunityId));
}

export function requestStatusFor(opportunity: Opportunity): RequestStatus {
  const engagement = engagements.find((item) => item.opportunityId === opportunity.id);
  if (engagement && (engagement.stage === 'commenced' || engagement.stage === 'contract-signed')) return 'in-delivery';
  if (opportunity.stage === 'consented') return 'engaging';
  if (opportunity.stage === 'matched') return 'shortlisting';
  return 'published';
}

export interface BuyerShortlistCandidate {
  candidate: ShortlistCandidate;
  actor?: Actor;
  /** DEM-09: identity is only disclosed under an active consent grant for this opportunity,
   * or an introduction the exporter accepted and hasn't withdrawn. */
  disclosed: boolean;
  introduction?: IntroductionRequest;
}

export function buyerShortlist(
opportunity: Opportunity,
introductions: IntroductionRequest[] = [])
: BuyerShortlistCandidate[] | undefined {
  const shortlist = shortlists.find((item) => item.opportunityId === opportunity.id);
  if (!shortlist) return undefined;
  return shortlist.candidates.map((candidate) => {
    const actor = actors.find((item) => item.natepId === candidate.natepId);
    const introduction = introductions.find((item) => item.id === candidate.id);
    const disclosed =
    introduction?.response === 'accepted' ||
    Boolean(
      actor &&
      consentGrants.some(
        (grant) =>
        grant.actorId === actor.id && grant.linkedOpportunityId === opportunity.id && grant.status === 'active'
      )
    );
    return { candidate, actor, disclosed, introduction };
  });
}

/** The shortlisted candidate the buyer already went ahead with, if an engagement shows it —
 * so a request already in delivery doesn't ask the buyer to choose again. */
export function engagedCandidateId(opportunity: Opportunity): string | undefined {
  const engagement = engagements.find((item) => item.opportunityId === opportunity.id);
  const grant = engagement && consentGrants.find((item) => item.id === engagement.consentGrantId);
  const actor = grant && actors.find((item) => item.id === grant.actorId);
  if (!actor) return undefined;
  return buyerShortlist(opportunity)?.find((item) => item.candidate.natepId === actor.natepId)?.candidate.id;
}
