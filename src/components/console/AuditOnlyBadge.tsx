import React from 'react';
import { EyeIcon } from 'lucide-react';

/** Shown in place of an action button under the simulated ROLE_ADSPA_OFFICER login —
 * that role can inspect every queue but the BRD forbids it from modifying records. */
export function AuditOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[12px] font-medium text-amber-700">
      <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />
      Audit view only
    </span>);

}
