import React from 'react';
import { AlertTriangleIcon, CheckIcon, ShieldCheckIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import { documentKindLabels, type DocumentVerificationStatus, type VaultDocument } from '../../data/vaultDocuments';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface EvidenceVaultProps {
  documents: VaultDocument[];
  actorsById: Map<string, Actor>;
  onDecide: (documentId: string, status: DocumentVerificationStatus) => void;
  canMutate: boolean;
}

const malwareStyles: Record<VaultDocument['malwareScan'], string> = {
  clean: 'bg-emerald-50 text-emerald-700',
  scanning: 'bg-sky-50 text-sky-700',
  flagged: 'bg-rose-50 text-rose-700'
};

export function EvidenceVault({ documents, actorsById, onDecide, canMutate }: EvidenceVaultProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Document review</h2>
        <p className="text-[12.5px] text-gray-400">
          Every credential is malware-scanned and hashed on upload — reuse-by-reference means an exporter never
          uploads the same certificate twice.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {documents.map((document) => {
          const actor = actorsById.get(document.actorId);
          const status = document.verification;

          return (
            <li
              key={document.id}
              className={`rounded-xl border px-4 py-3 transition-colors duration-150 ease-out ${
              status === 'verified' ?
              'border-emerald-200 bg-emerald-50/40' :
              status === 'rejected' ?
              'border-gray-100 bg-gray-50 opacity-70' :
              'border-gray-100 bg-white'}`
              }>

              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{documentKindLabels[document.kind]}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${malwareStyles[document.malwareScan]}`}>

                      {document.malwareScan === 'flagged' && <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />}
                      {document.malwareScan === 'clean' && <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />}
                      Malware scan: {document.malwareScan}
                    </span>
                    {document.expiresInDays !== undefined && document.expiresInDays <= 30 &&
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-medium text-amber-700">
                        Expires in {document.expiresInDays}d
                      </span>
                    }
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {actor?.name ?? 'Unknown exporter'} · {document.fileName} · Uploaded {document.uploadedOn}
                  </p>
                  <p className="mt-1 truncate font-mono text-[10.5px] text-gray-300">SHA-256 {document.sha256}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'pending' && !canMutate && <AuditOnlyBadge />}
                  {status === 'pending' && canMutate &&
                  <>
                      <button
                    type="button"
                    onClick={() => onDecide(document.id, 'verified')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Verify
                      </button>
                      <button
                    type="button"
                    onClick={() => onDecide(document.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700">

                        <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </>
                  }
                  {status === 'verified' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified
                    </span>
                  }
                  {status === 'rejected' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[12px] font-medium text-gray-500">
                      <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Rejected
                    </span>
                  }
                </div>
              </div>
            </li>);

        })}
      </ul>
    </div>);

}
