export const headlineMetric = {
  label: 'Reconciled service export value, quarter to date',
  value: 14.25,
  unit: 'M USD',
  note: 'Single-counted across four trade institutions'
};

export const supportingMetrics = [
{ label: 'Active verified exporters', value: '1,420' },
{ label: 'Qualified opportunities live', value: '20.1k' },
{ label: 'Median officer qualification time', value: '31 hrs' }];


export const supplyModes = [
{ id: 'mode1', label: 'Mode 1 · Cross-border supply', value: 9.5, share: 100 },
{ id: 'mode3', label: 'Mode 3 · Commercial presence', value: 2.3, share: 24 },
{ id: 'mode4', label: 'Mode 4 · Natural persons', value: 1.25, share: 13 },
{ id: 'mode2', label: 'Mode 2 · Consumption abroad', value: 1.2, share: 12 }];


export const topCategories = [
{ code: '83131', label: 'IT consulting services', value: '6.20M' },
{ code: '83111', label: 'Financial advisory services', value: '3.10M' },
{ code: '85999', label: 'Business process outsourcing', value: '2.45M' }];


export type ReconciliationStatus = 'reconciled' | 'pending' | 'flagged';

export interface InstitutionReconciliation {
  institution: string;
  fullName: string;
  status: ReconciliationStatus;
  lastSynced: string;
  flaggedClaims: number;
}

export const institutionReconciliation: InstitutionReconciliation[] = [
{
  institution: 'NEPC',
  fullName: 'Nigerian Export Promotion Council',
  status: 'reconciled',
  lastSynced: '2026-09-15',
  flaggedClaims: 0
},
{
  institution: 'NEXIM',
  fullName: 'Nigerian Export-Import Bank',
  status: 'flagged',
  lastSynced: '2026-09-13',
  flaggedClaims: 3
},
{
  institution: 'CBN',
  fullName: 'Central Bank of Nigeria',
  status: 'reconciled',
  lastSynced: '2026-09-15',
  flaggedClaims: 0
},
{
  institution: 'FIRS',
  fullName: 'Federal Inland Revenue Service',
  status: 'pending',
  lastSynced: '2026-09-09',
  flaggedClaims: 1
}];


export interface RegionalShare {
  region: string;
  share: number;
}

export const regionalDistribution: RegionalShare[] = [
{ region: 'Lagos', share: 42 },
{ region: 'Abuja (FCT)', share: 24 },
{ region: 'Rivers', share: 9 },
{ region: 'Kaduna', share: 7 },
{ region: 'Oyo', share: 6 },
{ region: 'Other states', share: 12 }];


export interface InclusionSegment {
  segment: string;
  share: number;
}

export const inclusionBreakdown: InclusionSegment[] = [
{ segment: 'Women-led firms', share: 31 },
{ segment: 'Youth-led firms (under 35)', share: 27 },
{ segment: 'Firms outside Lagos/Abuja', share: 38 },
{ segment: 'First-time exporters', share: 22 }];