import type { OutcomeReport } from '../data/outcomes';

export function groupReportsByEngagement(reports: OutcomeReport[]): Map<string, OutcomeReport[]> {
  const groups = new Map<string, OutcomeReport[]>();
  for (const report of reports) {
    const group = groups.get(report.engagementId) ?? [];
    group.push(report);
    groups.set(report.engagementId, group);
  }
  return groups;
}

/** True once one report in the group has already been confirmed — verifying another
 * would count the same underlying export value twice. */
export function hasConfirmedSibling(report: OutcomeReport, group: OutcomeReport[]): boolean {
  return group.some((item) => item.id !== report.id && item.verification === 'verified');
}

/** True while two (or more) reports for the same engagement are both still awaiting a
 * decision — the officer must pick one to avoid double-counting the same outcome. */
export function hasCompetingProvisionalSibling(report: OutcomeReport, group: OutcomeReport[]): boolean {
  return group.some((item) => item.id !== report.id && item.verification === 'provisional');
}
