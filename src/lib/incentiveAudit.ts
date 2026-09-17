import type { Actor } from '../data/actors';
import type { IncentiveApplication } from '../data/incentives';

export type AuditFailureCode =
'INCENTIVE_AUDIT_INACTIVE_STANDING' |
'INCENTIVE_AUDIT_ZERO_TRADE_VOLUME' |
'INCENTIVE_AUDIT_UNRESOLVED_COMPLIANCE_FLAG';

export const auditFailureLabels: Record<AuditFailureCode, string> = {
  INCENTIVE_AUDIT_INACTIVE_STANDING: 'Exporter is not in active verified standing',
  INCENTIVE_AUDIT_ZERO_TRADE_VOLUME: 'Verified trade volume below the escrow floor',
  INCENTIVE_AUDIT_UNRESOLVED_COMPLIANCE_FLAG: 'Unresolved compliance flag on file'
};

export interface IncentiveAuditResult {
  activeStanding: boolean;
  sufficientTradeVolume: boolean;
  noComplianceFlags: boolean;
  passed: boolean;
  failureCodes: AuditFailureCode[];
  avt?: string;
}

/** BRD §5.4's three-condition check, run against Module 4's application before it may
 * reach payment authorization — deliberately independent of that page's own
 * `autoPreQualified` flag (a single escrow-volume threshold) so this catches things the
 * shallower check doesn't, like a suspended account still holding sufficient volume. */
const ESCROW_VOLUME_FLOOR_USD = 50000;

export function auditIncentiveApplication(
application: IncentiveApplication,
actor: Actor | undefined)
: IncentiveAuditResult {
  const activeStanding = Boolean(actor) && (actor!.tier === 'verified' || actor!.tier === 'top-rated') && !actor!.suspended;
  const sufficientTradeVolume = application.verifiedExportVolume >= ESCROW_VOLUME_FLOOR_USD;
  const noComplianceFlags = !actor || actor.verificationQueue === 'none';

  const failureCodes: AuditFailureCode[] = [];
  if (!activeStanding) failureCodes.push('INCENTIVE_AUDIT_INACTIVE_STANDING');
  if (!sufficientTradeVolume) failureCodes.push('INCENTIVE_AUDIT_ZERO_TRADE_VOLUME');
  if (!noComplianceFlags) failureCodes.push('INCENTIVE_AUDIT_UNRESOLVED_COMPLIANCE_FLAG');

  const passed = failureCodes.length === 0;

  return {
    activeStanding,
    sufficientTradeVolume,
    noComplianceFlags,
    passed,
    failureCodes,
    avt: passed ? `AVT-${application.submittedOn.replace(/-/g, '')}-${application.id.toUpperCase()}` : undefined
  };
}
