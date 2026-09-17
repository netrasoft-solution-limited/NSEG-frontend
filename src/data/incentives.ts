export type IncentiveType = 'export-expansion-grant' | 'tax-credit' | 'trade-mission-subsidy';
export type IncentiveReviewStatus = 'pending' | 'approved' | 'declined';

export interface IncentiveApplication {
  id: string;
  actorId: string;
  type: IncentiveType;
  requestedAmount: number;
  verifiedExportVolume: number;
  /** Set by the rules engine when verifiedExportVolume clears the $50,000 threshold —
   * pre-qualification only fast-tracks review, the officer sign-off below still decides. */
  autoPreQualified: boolean;
  submittedOn: string;
  reviewStatus: IncentiveReviewStatus;
}

export const incentiveTypeLabels: Record<IncentiveType, string> = {
  'export-expansion-grant': 'Export Expansion Grant',
  'tax-credit': 'Trade Tax Credit',
  'trade-mission-subsidy': 'Trade Mission Subsidy'
};

export const incentiveApplications: IncentiveApplication[] = [
{
  id: 'inc-01',
  actorId: 'act-10',
  type: 'export-expansion-grant',
  requestedAmount: 18000,
  verifiedExportVolume: 103000,
  autoPreQualified: true,
  submittedOn: '2026-09-09',
  reviewStatus: 'pending'
},
{
  id: 'inc-02',
  actorId: 'act-05',
  type: 'tax-credit',
  requestedAmount: 9500,
  verifiedExportVolume: 88000,
  autoPreQualified: true,
  submittedOn: '2026-09-07',
  reviewStatus: 'pending'
},
{
  id: 'inc-03',
  actorId: 'act-03',
  type: 'trade-mission-subsidy',
  requestedAmount: 4200,
  verifiedExportVolume: 61000,
  autoPreQualified: true,
  submittedOn: '2026-09-05',
  reviewStatus: 'pending'
},
{
  id: 'inc-04',
  actorId: 'act-08',
  type: 'export-expansion-grant',
  requestedAmount: 15000,
  verifiedExportVolume: 54000,
  autoPreQualified: true,
  submittedOn: '2026-09-01',
  reviewStatus: 'approved'
},
{
  id: 'inc-05',
  actorId: 'act-01',
  type: 'tax-credit',
  requestedAmount: 6000,
  verifiedExportVolume: 42000,
  autoPreQualified: false,
  submittedOn: '2026-08-27',
  reviewStatus: 'declined'
},
{
  id: 'inc-06',
  actorId: 'act-11',
  type: 'trade-mission-subsidy',
  requestedAmount: 3000,
  verifiedExportVolume: 15000,
  autoPreQualified: false,
  submittedOn: '2026-08-20',
  reviewStatus: 'declined'
}];
