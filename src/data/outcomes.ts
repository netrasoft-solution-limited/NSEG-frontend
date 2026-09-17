export type OutcomeVerificationStatus = 'provisional' | 'verified' | 'rejected';
export type OutcomeReporter = 'exporter' | 'buyer';

/** Either party to a commenced engagement can self-report completed export value (BRD's
 * "Outcome Report" decision boundary: self-reported revenue is tagged Provisional and
 * excluded from the Observatory until an Authorised Verifier independently confirms it —
 * §3.10 Outcome Verification & Attribution Engine). Both parties self-reporting the same
 * engagement is the normal case the duplicate-value check exists for, not an error state. */
export interface OutcomeReport {
  id: string;
  engagementId: string;
  reportedBy: OutcomeReporter;
  amount: number;
  currency: string;
  reportedOn: string;
  evidenceSummary: string;
  verification: OutcomeVerificationStatus;
  verificationNote?: string;
}

export const outcomeReports: OutcomeReport[] = [
{
  id: 'out-01',
  engagementId: 'eng-05',
  reportedBy: 'exporter',
  amount: 62000,
  currency: 'USD',
  reportedOn: '2026-09-08',
  evidenceSummary: 'Signed completion certificate and final invoice uploaded to the vault.',
  verification: 'provisional'
},
{
  id: 'out-02',
  engagementId: 'eng-05',
  reportedBy: 'buyer',
  amount: 62000,
  currency: 'USD',
  reportedOn: '2026-09-11',
  evidenceSummary: 'Buyer confirms the engagement was delivered per the statement of work; internal purchase order closed.',
  verification: 'provisional'
},
{
  id: 'out-03',
  engagementId: 'eng-02',
  reportedBy: 'exporter',
  amount: 38000,
  currency: 'USD',
  reportedOn: '2026-08-22',
  evidenceSummary: 'Milestone-based invoices for the full enterprise data migration advisory engagement.',
  verification: 'verified',
  verificationNote: 'Confirmed against invoice and buyer purchase order — no duplicate claims found.'
}];
