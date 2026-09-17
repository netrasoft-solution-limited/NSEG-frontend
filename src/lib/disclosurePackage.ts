import type { Actor } from '../data/actors';
import type { ConsentGrant } from '../data/consentGrants';
import { documentKindLabels, type VaultDocument } from '../data/vaultDocuments';

/** A Shared Disclosure Package is a derived artifact, not a stored record (BRD §2.6 /
 * Cross-Portal Canonical Information Package #7) — it's rebuilt on demand from whatever
 * the consent grant currently authorizes, so revoking or expiring the grant instantly
 * voids every package built from it, with no separate record left to clean up. */
export interface DisclosurePackage {
  packageId: string;
  recipient: string;
  purpose: string;
  fields: string[];
  issuedOn: string;
  valid: boolean;
  voidReason?: string;
  evidence: string[];
  pendingEvidenceCount: number;
}

export function buildDisclosurePackage(
grant: ConsentGrant,
actor: Actor | undefined,
vaultDocuments: VaultDocument[])
: DisclosurePackage {
  const actorDocuments = actor ? vaultDocuments.filter((doc) => doc.actorId === actor.id) : [];
  const evidence = actorDocuments.
  filter((doc) => doc.verification === 'verified').
  map((doc) => documentKindLabels[doc.kind]);
  const pendingEvidenceCount = actorDocuments.filter((doc) => doc.verification !== 'verified').length;

  return {
    packageId: `DISC-${grant.id.toUpperCase()}`,
    recipient: grant.recipient,
    purpose: grant.purpose,
    fields: grant.fieldsDisclosed,
    issuedOn: grant.grantedOn,
    valid: grant.status === 'active',
    voidReason:
    grant.status === 'revoked' ?
    'Consent was revoked — package access is void (HTTP 410 equivalent).' :
    grant.status === 'expired' ?
    'Consent has expired — package access is void (HTTP 410 equivalent).' :
    undefined,
    evidence,
    pendingEvidenceCount
  };
}
