import React from 'react';
import { ShieldOffIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import type { ConsentGrant, ConsentStatus } from '../../data/consentGrants';
import type { VaultDocument } from '../../data/vaultDocuments';
import { buildDisclosurePackage } from '../../lib/disclosurePackage';
import { DisclosurePackageViewer } from './DisclosurePackageViewer';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface ConsentRegisterProps {
  grants: ConsentGrant[];
  actorsById: Map<string, Actor>;
  vaultDocuments: VaultDocument[];
  overrides: Record<string, ConsentStatus>;
  onRevoke: (grantId: string) => void;
  onViewPackage: (grantId: string) => void;
  canMutate: boolean;
}

const statusStyles: Record<ConsentStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  revoked: 'bg-rose-50 text-rose-700',
  expired: 'bg-gray-100 text-gray-500'
};

export function ConsentRegister({
  grants,
  actorsById,
  vaultDocuments,
  overrides,
  onRevoke,
  onViewPackage,
  canMutate
}: ConsentRegisterProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Consent grants</h2>
        <p className="text-[12.5px] text-gray-400">
          Exporters grant these — an officer's role is oversight, revoking a grant only in a compliance investigation.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {grants.map((grant) => {
          const actor = actorsById.get(grant.actorId);
          const status = overrides[grant.id] ?? grant.status;

          return (
            <li key={grant.id} className="rounded-xl border border-gray-100 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor?.name ?? 'Unknown exporter'}</p>
                    <span className="text-[12px] text-gray-400">→</span>
                    <p className="text-[13px] text-gray-700">{grant.recipient}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium ${statusStyles[status]}`}>
                      {status}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-gray-500">{grant.purpose}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {grant.fieldsDisclosed.map((field) =>
                    <span key={field} className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] text-gray-500">
                        {field}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11.5px] text-gray-400">Granted {grant.grantedOn}</p>
                  <DisclosurePackageViewer
                    package={buildDisclosurePackage({ ...grant, status }, actor, vaultDocuments)}
                    onView={() => onViewPackage(grant.id)} />

                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'active' && !canMutate && <AuditOnlyBadge />}
                  {status === 'active' && canMutate &&
                  <button
                    type="button"
                    onClick={() => onRevoke(grant.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-rose-300 hover:text-rose-700">

                      <ShieldOffIcon className="h-3.5 w-3.5" aria-hidden="true" />
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
