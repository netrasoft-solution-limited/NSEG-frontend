import React from 'react';
import { AlertTriangleIcon, BadgeCheckIcon, BellIcon, CheckIcon, XIcon } from 'lucide-react';
import type { Actor } from '../../data/actors';
import { documentKindLabels, type DocumentVerificationStatus, type VaultDocument } from '../../data/vaultDocuments';
import { certifyingBodyFor, renewalUrgency } from '../../lib/certification';
import { AuditOnlyBadge } from './AuditOnlyBadge';

interface CertificationRegistryProps {
  documents: VaultDocument[];
  actorsById: Map<string, Actor>;
  decisions: Record<string, DocumentVerificationStatus>;
  remindersSent: Record<string, boolean>;
  onDecide: (id: string, status: DocumentVerificationStatus) => void;
  onSendReminder: (id: string) => void;
  canMutate: boolean;
}

const urgencyStyles = {
  urgent: 'border-rose-200 bg-rose-50/40',
  warning: 'border-amber-200 bg-amber-50/40',
  none: 'border-gray-100 bg-white'
} as const;

export function CertificationRegistry({
  documents,
  actorsById,
  decisions,
  remindersSent,
  onDecide,
  onSendReminder,
  canMutate
}: CertificationRegistryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6">
      <div>
        <h2 className="text-[16px] font-semibold text-gray-900">Sectoral certifications</h2>
        <p className="text-[12.5px] text-gray-400">
          Professional and sectoral credentials — COREN, ISO 27001, and equivalent regulator
          clearances — verified once and badged to the exporter's public trust profile.
        </p>
      </div>

      <ul className="mt-4 space-y-2">
        {documents.map((document) => {
          const actor = actorsById.get(document.actorId);
          const status = decisions[document.id] ?? document.verification;
          const urgency = status === 'verified' ? renewalUrgency(document.expiresInDays) : 'none';
          const reminderSent = remindersSent[document.id];

          return (
            <li key={document.id} className={`rounded-xl border px-4 py-3 ${urgencyStyles[urgency]}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{actor?.name ?? 'Unknown exporter'}</p>
                    <span className="rounded-full bg-gray-50 px-2 py-0.5 text-[10.5px] font-medium text-gray-500">
                      {certifyingBodyFor(document)}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-400">
                    {documentKindLabels[document.kind]} · Uploaded {document.uploadedOn}
                  </p>
                  {status === 'verified' && document.expiresInDays !== undefined &&
                  <p
                    className={`mt-1 flex items-center gap-1 text-[11.5px] font-medium ${
                    urgency === 'urgent' ? 'text-rose-600' : urgency === 'warning' ? 'text-amber-700' : 'text-gray-400'}`
                    }>

                      {urgency !== 'none' && <AlertTriangleIcon className="h-3 w-3" aria-hidden="true" />}
                      Expires in {document.expiresInDays}d
                      {urgency !== 'none' && ' — renewal warning; badge downgrades if it lapses'}
                    </p>
                  }
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status === 'pending' && !canMutate && <AuditOnlyBadge />}
                  {status === 'pending' && canMutate &&
                  <>
                      <button
                      type="button"
                      onClick={() => onDecide(document.id, 'verified')}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors duration-150 ease-out hover:bg-black">

                        <BadgeCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Issue certification
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
                  {status === 'verified' && urgency !== 'none' && canMutate &&
                  <button
                    type="button"
                    onClick={() => onSendReminder(document.id)}
                    disabled={reminderSent}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors duration-150 ease-out hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">

                      <BellIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {reminderSent ? 'Reminder sent' : 'Send renewal reminder'}
                    </button>
                  }
                  {status === 'verified' &&
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
                      <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Certified
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
