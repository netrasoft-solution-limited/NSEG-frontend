import {
  pathwayCategoryOrder,
  regulatoryRequirements,
  type RegulatoryRequirement,
  type RequirementCategory,
  type SupplyModeId,
  type TargetMarketId } from
'../data/regulations';
import type { EvidenceKey, ExporterTrack } from '../data/trustTiers';

export interface PathwayAnswers {
  track: ExporterTrack;
  sectorCode: string;
  mode: SupplyModeId;
  market: TargetMarketId;
}

export interface PathwayItem {
  requirement: RegulatoryRequirement;
  alreadyMet: boolean;
}

export interface Pathway {
  groups: { category: RequirementCategory; items: PathwayItem[] }[];
  total: number;
  metCount: number;
  /** Requirements that would apply but are being reviewed — counted, never shown as guidance. */
  underReviewCount: number;
}

function appliesTo(requirement: RegulatoryRequirement, answers: PathwayAnswers): boolean {
  const { tracks, modes, markets } = requirement.appliesTo;
  return (
    (!requirement.sectorCode || requirement.sectorCode === answers.sectorCode) &&
    (!tracks || tracks.includes(answers.track)) &&
    (!modes || modes.includes(answers.mode)) &&
    (!markets || markets.includes(answers.market)));

}

/** REG-03: only requirements in 'current' status reach the exporter as guidance. */
export function buildPathway(answers: PathwayAnswers, verifiedEvidence: EvidenceKey[]): Pathway {
  const applicable = regulatoryRequirements.filter((requirement) => appliesTo(requirement, answers));
  const current = applicable.filter((requirement) => requirement.status === 'current');

  const groups = pathwayCategoryOrder.
  map((category) => ({
    category,
    items: current.
    filter((requirement) => requirement.category === category).
    map((requirement) => ({
      requirement,
      alreadyMet: Boolean(requirement.satisfiedBy && verifiedEvidence.includes(requirement.satisfiedBy))
    }))
  })).
  filter((group) => group.items.length > 0);

  return {
    groups,
    total: current.length,
    metCount: groups.reduce((count, group) => count + group.items.filter((item) => item.alreadyMet).length, 0),
    underReviewCount: applicable.filter((requirement) => requirement.status === 'under-review').length
  };
}
