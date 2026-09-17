import React from 'react';
import { AlertTriangleIcon, UserMinusIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import type { Buyer } from '../../data/buyers';
import type { Delegation, DelegationStatus } from '../../data/delegations';
import { orgFor } from '../../lib/delegationLookup';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface DelegationRegistryProps {
  delegations: Delegation[];
  actorsById: Map<string, Actor>;
  buyersById: Map<string, Buyer>;
  overrides: Record<string, DelegationStatus>;
  onRevoke: (id: string) => void;
  canMutate: boolean;
}

const statusStyles: Record<DelegationStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  'expiring-soon': 'bg-amber-50 text-amber-700',
  expired: 'bg-gray-100 text-gray-500',
  revoked: 'bg-rose-50 text-rose-700'
};

const statusLabels: Record<DelegationStatus, string> = {
  active: 'Active',
  'expiring-soon': 'Expiring soon',
  expired: 'Expired',
  revoked: 'Revoked'
};

const roleLabels: Record<Delegation['delegateRole'], string> = {
  employee: 'Employee',
  contractor: 'Contractor',
  'branch-officer': 'Branch officer'
};

export function DelegationRegistry({
  delegations,
  actorsById,
  buyersById,
  overrides,
  onRevoke,
  canMutate
}: DelegationRegistryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Delegated access</h2>
        <p className="text-[12.5px] text-gray-400">
          Enterprise Administrators assign these — an officer's role is oversight, revoking access
          only in a compliance investigation.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {delegations.map((delegation) => {
          const org = orgFor(delegation, actorsById, buyersById);
          const status = overrides[delegation.id] ?? delegation.status;
          const urgent = status === 'expiring-soon' && (delegation.expiresInDays ?? 99) <= 7;

          return (
            <li key={delegation.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{delegation.delegateName}</p>
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] font-medium text-gray-500">
                      {roleLabels[delegation.delegateRole]}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusStyles[status]}`}>
                      {statusLabels[status]}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-gray-700">
                    Acting for <span className="font-medium text-gray-900">{org?.name ?? delegation.actorId}</span>{' '}
                    <span className="font-mono text-[10.5px] text-gray-400">{org?.referenceId}</span>
                  </p>
                  <p className="mt-1.5 text-[11.5px] text-gray-400">Assigned {delegation.assignedOn}</p>
                  {status === 'expiring-soon' && delegation.expiresInDays !== undefined &&
                  <p
                    className={`mt-1.5 flex items-center gap-1 text-[11.5px] font-medium ${
                    urgent ? 'text-rose-600' : 'text-amber-700'}`
                    }>

                      <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      Delegation lapses in {delegation.expiresInDays}d — the 365-day cap requires
                      recertification, not auto-renewal.
                    </p>
                  }
                  {delegation.note &&
                  <p className="mt-1.5 text-[11.5px] text-gray-400">{delegation.note}</p>
                  }
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {(status === 'active' || status === 'expiring-soon') && !canMutate && <AuditOnlyBadge />}
                  {(status === 'active' || status === 'expiring-soon') && canMutate &&
                  <button
                    type="button"
                    onClick={() => onRevoke(delegation.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-rose-300 hover:text-rose-700">

                      <UserMinusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Revoke
                    </button>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
