import type { ReadinessParameterScores } from '../lib/readinessScore';

export type AssertionStatus = 'pending' | 'issued' | 'withheld';

export interface ReadinessSubmission {
  id: string;
  actorId: string;
  submittedOn: string;
  parameterScores: ReadinessParameterScores;
  evidenceGaps: string[];
  assertionStatus: AssertionStatus;
}

export const readinessSubmissions: ReadinessSubmission[] = [
{
  id: 'rs-01',
  actorId: 'act-04',
  submittedOn: '2026-09-11',
  parameterScores: { exportCapacity: 60, financialStability: 55, qualitySystems: 55, crossBorderExperience: 60, legalIpProtection: 60 },
  evidenceGaps: ['CAC registration certificate', 'Bank reference letter'],
  assertionStatus: 'pending'
},
{
  id: 'rs-02',
  actorId: 'act-07',
  submittedOn: '2026-09-10',
  parameterScores: { exportCapacity: 50, financialStability: 45, qualitySystems: 40, crossBorderExperience: 45, legalIpProtection: 50 },
  evidenceGaps: ['Sector regulatory clearance', 'Portfolio evidence', 'Tax identification number'],
  assertionStatus: 'pending'
},
{
  id: 'rs-03',
  actorId: 'act-02',
  submittedOn: '2026-09-08',
  parameterScores: { exportCapacity: 85, financialStability: 80, qualitySystems: 78, crossBorderExperience: 80, legalIpProtection: 80 },
  evidenceGaps: ['Cross-border delivery reference'],
  assertionStatus: 'pending'
},
{
  id: 'rs-04',
  actorId: 'act-09',
  submittedOn: '2026-09-07',
  parameterScores: { exportCapacity: 40, financialStability: 35, qualitySystems: 35, crossBorderExperience: 40, legalIpProtection: 45 },
  evidenceGaps: ['CAC registration certificate', 'Professional indemnity cover', 'Director ID verification'],
  assertionStatus: 'pending'
},
{
  id: 'rs-05',
  actorId: 'act-08',
  submittedOn: '2026-09-02',
  parameterScores: { exportCapacity: 90, financialStability: 88, qualitySystems: 85, crossBorderExperience: 88, legalIpProtection: 88 },
  evidenceGaps: [],
  assertionStatus: 'issued'
},
{
  id: 'rs-06',
  actorId: 'act-12',
  submittedOn: '2026-08-29',
  parameterScores: { exportCapacity: 55, financialStability: 50, qualitySystems: 48, crossBorderExperience: 50, legalIpProtection: 55 },
  evidenceGaps: ['Bank reference letter'],
  assertionStatus: 'withheld'
},
{
  id: 'rs-07',
  actorId: 'act-05',
  submittedOn: '2026-08-24',
  parameterScores: { exportCapacity: 95, financialStability: 90, qualitySystems: 90, crossBorderExperience: 92, legalIpProtection: 90 },
  evidenceGaps: [],
  assertionStatus: 'issued'
}];
