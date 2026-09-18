import type { Actor } from '../data/actors';
import { consentGrants, type ConsentGrant } from '../data/consentGrants';
import { engagements, type Engagement } from '../data/engagements';
import { opportunities, type Opportunity } from '../data/opportunities';
import { buyers, type Buyer } from '../data/buyers';
import type { IntroductionRequest } from './gatewayExchange';

/** What an accepted introduction discloses (FND-05/06): enough to decide on a conversation,
 * nothing more. */
export const introductionFields = ['Your name and NATEP ID', 'Your tier and what was verified', 'Your verified certifications'];

export function grantsFor(actor: Actor): ConsentGrant[] {
  return consentGrants.filter((grant) => grant.actorId === actor.id);
}

export interface ExporterEngagement {
  engagement: Engagement;
  grant: ConsentGrant;
  opportunity: Opportunity;
  buyer?: Buyer;
}

/** Engagements that came from this exporter's consent grants — the exporter's side of a contract. */
export function engagementsFor(actor: Actor): ExporterEngagement[] {
  const grants = grantsFor(actor);
  return engagements.flatMap((engagement) => {
    const grant = grants.find((item) => item.id === engagement.consentGrantId);
    const opportunity = opportunities.find((item) => item.id === engagement.opportunityId);
    if (!grant || !opportunity) return [];
    return [{ engagement, grant, opportunity, buyer: buyers.find((item) => item.id === opportunity.buyerId) }];
  });
}

export interface DisclosureRow {
  id: string;
  recipient: string;
  fields: string[];
  issued: string;
  status: 'active' | 'withdrawn' | 'expired';
  /** Set for introductions accepted this session, which can be withdrawn here. */
  introduction?: IntroductionRequest;
}

/** Every package of this exporter's details released to a buyer: earlier consent grants plus
 * introductions accepted in this session. Declined requests never created a disclosure. */
export function disclosuresFor(actor: Actor, introductions: IntroductionRequest[]): DisclosureRow[] {
  const fromIntroductions: DisclosureRow[] = introductions.
  filter((item) => item.actorId === actor.id && (item.response === 'accepted' || item.response === 'withdrawn')).
  map((item) => ({
    id: item.id,
    recipient: buyers.find((buyer) => buyer.id === item.buyerId)?.name ?? 'A buyer',
    fields: introductionFields,
    issued: 'Today',
    status: item.response === 'accepted' ? 'active' : 'withdrawn',
    introduction: item
  }));
  const fromGrants: DisclosureRow[] = grantsFor(actor).map((grant) => ({
    id: grant.id,
    recipient: grant.recipient,
    fields: grant.fieldsDisclosed,
    issued: grant.grantedOn,
    status: grant.status === 'active' ? 'active' : grant.status === 'revoked' ? 'withdrawn' : 'expired'
  }));
  return [...fromIntroductions, ...fromGrants];
}
