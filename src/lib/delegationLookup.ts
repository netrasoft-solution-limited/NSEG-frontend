import type { Actor } from '../data/actors';
import type { Buyer } from '../data/buyers';
import type { Delegation } from '../data/delegations';

export interface DelegatingOrg {
  name: string;
  referenceId: string;
}

export function orgFor(
delegation: Delegation,
actorsById: Map<string, Actor>,
buyersById: Map<string, Buyer>)
: DelegatingOrg | undefined {
  if (delegation.actorKind === 'exporter') {
    const actor = actorsById.get(delegation.actorId);
    return actor ? { name: actor.name, referenceId: actor.natepId } : undefined;
  }
  const buyer = buyersById.get(delegation.actorId);
  return buyer ? { name: buyer.name, referenceId: buyer.referenceId } : undefined;
}
