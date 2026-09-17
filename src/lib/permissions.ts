import type { OfficerRole } from './officerProfile';

/** ROLE_ADSPA_OFFICER's BRD restriction (Module 2 §3.2): full inspection access, but
 * "cannot modify database records, user permissions, or system configurations." Every
 * mutating action across the console checks this — viewing, filtering, and exporting
 * stay available under audit mode, only state-changing actions are gated. */
export function canMutate(role: OfficerRole): boolean {
  return role !== 'adspa-auditor';
}
