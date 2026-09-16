export type AssertionStatus = 'pending' | 'issued' | 'withheld';

export interface ReadinessSubmission {
  id: string;
  actorId: string;
  submittedOn: string;
  selfScore: number;
  evidenceGaps: string[];
  assertionStatus: AssertionStatus;
}

export const readinessSubmissions: ReadinessSubmission[] = [
{
  id: 'rs-01',
  actorId: 'act-04',
  submittedOn: '2026-09-11',
  selfScore: 58,
  evidenceGaps: ['CAC registration certificate', 'Bank reference letter'],
  assertionStatus: 'pending'
},
{
  id: 'rs-02',
  actorId: 'act-07',
  submittedOn: '2026-09-10',
  selfScore: 46,
  evidenceGaps: ['Sector regulatory clearance', 'Portfolio evidence', 'Tax identification number'],
  assertionStatus: 'pending'
},
{
  id: 'rs-03',
  actorId: 'act-02',
  submittedOn: '2026-09-08',
  selfScore: 81,
  evidenceGaps: ['Cross-border delivery reference'],
  assertionStatus: 'pending'
},
{
  id: 'rs-04',
  actorId: 'act-09',
  submittedOn: '2026-09-07',
  selfScore: 39,
  evidenceGaps: ['CAC registration certificate', 'Professional indemnity cover', 'Director ID verification'],
  assertionStatus: 'pending'
},
{
  id: 'rs-05',
  actorId: 'act-08',
  submittedOn: '2026-09-02',
  selfScore: 88,
  evidenceGaps: [],
  assertionStatus: 'issued'
},
{
  id: 'rs-06',
  actorId: 'act-12',
  submittedOn: '2026-08-29',
  selfScore: 52,
  evidenceGaps: ['Bank reference letter'],
  assertionStatus: 'withheld'
},
{
  id: 'rs-07',
  actorId: 'act-05',
  submittedOn: '2026-08-24',
  selfScore: 92,
  evidenceGaps: [],
  assertionStatus: 'issued'
}];
