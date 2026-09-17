import type { Actor } from '../data/actors';
import { evidenceLabels, type EvidenceKey } from '../data/trustTiers';
import type { RegulatoryRequirement } from '../data/regulations';
import { computeReadinessScore } from './readinessScore';
import { sectorLabel } from './marketplaceLookups';

/** One thing an assertion rests on. When it cites a requirement version, publishing a newer
 * version of that requirement flags the assertion for revalidation (REG-05). */
export interface AssertionBasis {
  label: string;
  authority: string;
  verifiedOn: string;
  requirementId?: string;
  requirementVersion?: number;
}

export type AssertionStatus = 'valid' | 'revalidation-required' | 'withdrawn';

export interface AssertionEvent {
  on: string;
  by: string;
  event: string;
}

/** REG-06: purpose-bound, time-stamped, scope-limited, and explicit about what it doesn't cover. */
export interface ReadinessAssertion {
  id: string;
  actorId: string;
  purpose: string;
  scope: string;
  issuedBy: string;
  issuedOn: string;
  expiresOn: string;
  basis: AssertionBasis[];
  notCovered: string[];
  status: AssertionStatus;
  /** Set while revalidation is required: which change caused it. */
  flaggedBy?: {impactId: string;requirementTitle: string;fromId: string;toId: string;};
  history: AssertionEvent[];
}

/** Evidence verified against a register requirement. Credentials and delivery history are
 * verified by other bodies, so they carry an authority but no requirement. */
const evidenceRequirement: Partial<Record<EvidenceKey, string>> = {
  cac: 'reg-01',
  tin: 'reg-05',
  nin: 'reg-13'
};

const evidenceAuthority: Record<EvidenceKey, string> = {
  cac: 'Corporate Affairs Commission',
  tin: 'Nigeria Revenue Service',
  nin: 'National Identity Management Commission',
  'professional-credential': 'Issuing professional body',
  'delivery-history': 'NATEP outcome verification'
};

/** Settlement readiness is reviewed against these requirement lineages. */
const settlementRequirements = ['reg-07', 'reg-15'];

export const lineageOf = (id: string) => id.replace(/-v\d+$/, '');

/** The version of a requirement lineage that is current right now. */
export function currentVersionOf(lineage: string, requirements: RegulatoryRequirement[]): RegulatoryRequirement | undefined {
  return requirements.find((item) => lineageOf(item.id) === lineage && item.status === 'current');
}

function addMonths(date: string, months: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next.toISOString().slice(0, 10);
}

export function buildAssertionBasis(
actor: Actor,
requirements: RegulatoryRequirement[],
verifiedOn: string)
: AssertionBasis[] {
  const basis: AssertionBasis[] = actor.verifiedEvidence.map((key) => {
    const lineage = evidenceRequirement[key];
    const requirement = lineage ? currentVersionOf(lineage, requirements) : undefined;
    return {
      label: evidenceLabels[key],
      authority: evidenceAuthority[key],
      verifiedOn,
      requirementId: requirement?.id,
      requirementVersion: requirement?.version
    };
  });
  for (const lineage of settlementRequirements) {
    const requirement = currentVersionOf(lineage, requirements);
    if (!requirement) continue;
    basis.push({
      label: `Settlement readiness reviewed: ${requirement.title}`,
      authority: requirement.authority,
      verifiedOn,
      requirementId: requirement.id,
      requirementVersion: requirement.version
    });
  }
  basis.push({
    label: `Readiness diagnostic reviewed (score ${computeReadinessScore(actor.diagnostic)})`,
    authority: 'NATEP Secretariat',
    verifiedOn
  });
  return basis;
}

export function buildAssertion(
actor: Actor,
requirements: RegulatoryRequirement[],
issuedBy: string,
issuedOn: string,
evidenceGaps: string[] = [])
: ReadinessAssertion {
  return {
    id: `ra-${actor.id}-${issuedOn}`,
    actorId: actor.id,
    purpose: 'Eligibility to be shortlisted for NATEP-qualified export opportunities',
    scope: `${sectorLabel(actor.sectorCode)} · cross-border service engagements`,
    issuedBy,
    issuedOn,
    expiresOn: addMonths(issuedOn, 12),
    basis: buildAssertionBasis(actor, requirements, issuedOn),
    notCovered: [
    'The quality of the exporter’s work or the outcome of any engagement',
    'Tax compliance beyond holding a valid TIN',
    'Requirements still under review at their authority',
    'Sectors and purposes outside the stated scope',
    ...evidenceGaps.map((gap) => `Not yet evidenced: ${gap}`)],

    status: 'valid',
    history: [{ on: issuedOn, by: issuedBy, event: 'Issued' }]
  };
}
