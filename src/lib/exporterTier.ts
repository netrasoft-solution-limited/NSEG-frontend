import {
  trustTiers,
  type EvidenceKey,
  type ExporterTrack,
  type TrustTier } from
'../data/trustTiers';
import { computeReadinessScore, readinessParameterWeights, type ReadinessParameterScores } from './readinessScore';

const evidenceActions: Record<EvidenceKey, string> = {
  cac: 'Get your CAC registration confirmed against the corporate registry',
  tin: 'Get your tax identification number validated',
  nin: 'Get your national identification number verified',
  'professional-credential': 'Get your professional credential confirmed by its issuing body',
  'delivery-history': 'Have a completed cross-border engagement verified'
};

export interface TierEvidenceInput {
  track: ExporterTrack;
  verifiedEvidence: EvidenceKey[];
  diagnostic: ReadinessParameterScores;
}

function meetsTier(tier: TrustTier, input: TierEvidenceInput, score: number): boolean {
  return (
    score >= tier.minDiagnostic &&
    tier.evidence[input.track].every((key) => input.verifiedEvidence.includes(key)));

}

/** PRD D-06 / SUP-05: the diagnostic drives the ladder, but a score alone never lifts a
 * tier — the evidence for that rung has to be verified too. Walks the ladder from the
 * bottom and stops at the first rung not met, so tiers can't be skipped. */
export function deriveExporterTier(input: TierEvidenceInput): TrustTier {
  const score = computeReadinessScore(input.diagnostic);
  let reached = trustTiers[0];
  for (const tier of trustTiers) {
    if (!meetsTier(tier, input, score)) break;
    reached = tier;
  }
  return reached;
}

export interface ExporterStanding {
  tier: TrustTier;
  next?: TrustTier;
  score: number;
  /** Evidence the next tier needs that isn't verified yet. */
  missingEvidence: EvidenceKey[];
  /** Diagnostic points still needed for the next tier (0 when already met). */
  scoreGap: number;
  weakestParameter: (typeof readinessParameterWeights)[number];
  /** SUP-06: the single most useful thing to do next, in plain words. */
  nextAction: string;
}

export function exporterStanding(input: TierEvidenceInput): ExporterStanding {
  const tier = deriveExporterTier(input);
  const score = computeReadinessScore(input.diagnostic);
  const next = trustTiers[trustTiers.indexOf(tier) + 1];
  const missingEvidence = next ?
  next.evidence[input.track].filter((key) => !input.verifiedEvidence.includes(key)) :
  [];
  const scoreGap = next ? Math.max(0, next.minDiagnostic - score) : 0;
  const weakestParameter = [...readinessParameterWeights].sort(
    (a, b) => input.diagnostic[a.key] - input.diagnostic[b.key]
  )[0];

  let nextAction: string;
  if (!next) {
    nextAction = 'You are at the top of the ladder. Keep your credentials current to hold this tier.';
  } else if (missingEvidence.length > 0) {
    const also = scoreGap > 0 ? ` You also need ${scoreGap} more diagnostic points.` : '';
    nextAction = `${evidenceActions[missingEvidence[0]]} to move toward ${next.badge}.${also}`;
  } else {
    nextAction = `Raise your diagnostic score by ${scoreGap} points to reach ${next.badge} — ${weakestParameter.label.toLowerCase()} is your lowest area.`;
  }

  return { tier, next, score, missingEvidence, scoreGap, weakestParameter, nextAction };
}

/** Rough distance to the next tier, for sorting "closest to next tier" lists. */
export function stepsToNextTier(standing: ExporterStanding): number {
  if (!standing.next) return Number.POSITIVE_INFINITY;
  return standing.missingEvidence.length * 20 + standing.scoreGap;
}
