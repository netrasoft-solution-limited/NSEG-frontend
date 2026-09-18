import type { ReadinessParameterScores } from '../lib/readinessScore';
import { actors } from './actors';

export type AssertionStatus = 'pending' | 'issued' | 'withheld';

export interface ReadinessSubmission {
  id: string;
  actorId: string;
  submittedOn: string;
  parameterScores: ReadinessParameterScores;
  evidenceGaps: string[];
  assertionStatus: AssertionStatus;
}

/** Scores come from the exporter's own diagnostic in actors.ts, so the console queue and
 * the tier the exporter sees in their workspace can never disagree. */
const submissionRecords: Omit<ReadinessSubmission, 'parameterScores'>[] = [
{
  id: 'rs-01',
  actorId: 'act-04',
  submittedOn: '2026-09-11',
  evidenceGaps: ['CAC registration certificate', 'Bank reference letter'],
  assertionStatus: 'pending'
},
{
  id: 'rs-02',
  actorId: 'act-07',
  submittedOn: '2026-09-10',
  evidenceGaps: ['Sector regulatory clearance', 'Portfolio evidence', 'Tax identification number'],
  assertionStatus: 'pending'
},
{
  id: 'rs-03',
  actorId: 'act-02',
  submittedOn: '2026-09-08',
  evidenceGaps: ['Cross-border delivery reference'],
  assertionStatus: 'pending'
},
{
  id: 'rs-04',
  actorId: 'act-09',
  submittedOn: '2026-09-07',
  evidenceGaps: ['CAC registration certificate', 'Professional indemnity cover', 'Director ID verification'],
  assertionStatus: 'pending'
},
{
  id: 'rs-05',
  actorId: 'act-08',
  submittedOn: '2026-09-02',
  evidenceGaps: [],
  assertionStatus: 'issued'
},
{
  id: 'rs-06',
  actorId: 'act-12',
  submittedOn: '2026-08-29',
  evidenceGaps: ['Bank reference letter'],
  assertionStatus: 'withheld'
},
{
  id: 'rs-07',
  actorId: 'act-05',
  submittedOn: '2026-08-24',
  evidenceGaps: [],
  assertionStatus: 'issued'
},
{
  id: 'rs-08',
  actorId: 'act-14',
  submittedOn: '2026-09-14',
  evidenceGaps: ['Professional credential confirmation'],
  assertionStatus: 'pending'
}];


export const readinessSubmissions: ReadinessSubmission[] = submissionRecords.map((record) => ({
  ...record,
  parameterScores: actors.find((actor) => actor.id === record.actorId)!.diagnostic
}));
