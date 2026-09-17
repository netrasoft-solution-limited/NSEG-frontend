export interface ReadinessParameterScores {
  exportCapacity: number;
  financialStability: number;
  qualitySystems: number;
  crossBorderExperience: number;
  legalIpProtection: number;
}

export const readinessParameterWeights: { key: keyof ReadinessParameterScores; label: string; weight: number }[] = [
{ key: 'exportCapacity', label: 'Export capacity', weight: 0.25 },
{ key: 'financialStability', label: 'Financial stability', weight: 0.2 },
{ key: 'qualitySystems', label: 'Quality management systems', weight: 0.2 },
{ key: 'crossBorderExperience', label: 'Cross-border delivery experience', weight: 0.2 },
{ key: 'legalIpProtection', label: 'Legal & IP protection', weight: 0.15 }];


export function computeReadinessScore(parameters: ReadinessParameterScores): number {
  const weighted = readinessParameterWeights.reduce(
    (total, { key, weight }) => total + parameters[key] * weight,
    0
  );
  return Math.round(weighted);
}

export type ReadinessTierLevel = 1 | 2 | 3;

export interface ReadinessTier {
  level: ReadinessTierLevel;
  label: string;
}

export function readinessTierFor(score: number): ReadinessTier {
  if (score >= 80) return { level: 3, label: 'Export Ready' };
  if (score >= 50) return { level: 2, label: 'Export Emerging' };
  return { level: 1, label: 'Export Capacity Building' };
}
